import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { BAD_REQUEST, FORBIDDEN, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { groupsTable, usersGroupsTable } from '../../../core/db/schema'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { DateUtil } from '../../../core/utils/date.util'
import { GroupDto, zSelectGroup } from '../../group/group.schema'
import { zSelectRole } from '../../role/role.schema'
import { zSelectUserWithoutPass } from '../../user/user.schema'
import { TokenCreateUserData, zLogin } from '../auth.schema'
import {
    findUserByEmail,
    findUserByPhone,
    getRoleByUserAndGroup,
    setDefaultGroupId,
    updateLastLogin,
    validateIdentifier,
} from '../auth.service'
import {
    ACCESS_TOKEN_LIFE,
    createAccessToken,
    createRefreshToken,
} from '../token.util'

const tags = ['Auth']

export const loginRoute = createRoute({
    path: '/v1/login',
    method: 'post',
    tags,
    request: {
        query: z.object({ groupId: z.string().optional() }),
        body: jsonContentRequired(zLogin, 'User login details'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                user: zSelectUserWithoutPass,
                group: zSelectGroup.optional(),
                role: zSelectRole.optional(),
                accessToken: z.string(),
                refreshToken: z.string(),
                lastLogin: z.string(),
                expiresIn: z.string(),
            }),
            'User login successful',
        ),

        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid email or password'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Invalid status!'),
    },
})

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
    const { identifier, password } = c.req.valid('json')

    const groupId = c.req.query('groupId')
    const identifierResult = validateIdentifier(identifier ?? '')
    const user =
        identifierResult.type === 'email'
            ? await findUserByEmail(identifier ?? '')
            : await findUserByPhone(identifier ?? '')

    if (!user) {
        return c.json(
            {
                message: 'Invalid email or password',
                data: {},
                success: false,
                error: 'Invalid email or password',
                meta: null,
            },
            BAD_REQUEST,
        )
    }

    if (user.status === 'inactive' || user.status === 'banned') {
        return c.json(
            {
                message: 'Your account is inactive',
                data: {},
                success: false,
                error: 'Your account is inactive',
                meta: null,
            },
            FORBIDDEN,
        )
    }

    const dateUtil = DateUtil
    const now = dateUtil.date()

    if (!(await argon2.verify(user.password, password))) {
        return c.json(
            {
                message: 'Invalid email or password',
                data: {},
                success: false,
                error: 'Invalid email or password',
                meta: null,
            },
            BAD_REQUEST,
        )
    }

    if (!user.verified) {
        return c.json(
            {
                message: 'Please verify your account first',
                data: {},
                success: false,
                error: 'Please verify your account first',
                meta: null,
            },
            FORBIDDEN,
        )
    }

    const tokenCreateUserData: TokenCreateUserData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email ?? null,
        phone: user.phone ?? null,
        username: user.username,
        id: user.id,
        status: user.status,
    }

    if (!user.defaultGroupId && groupId) {
        await setDefaultGroupId(user.id, groupId)
    }

    const expiresIn = dateUtil.addSeconds(now, ACCESS_TOKEN_LIFE).toISOString()

    // if query param has group id, get the user profile belonging to that group
    const chosenGroupId = groupId || user.defaultGroupId

    if (!chosenGroupId) {
        const userMemberships = await db.query.usersGroupsTable.findMany({
            where: eq(usersGroupsTable.userId, user.id),
        })

        if (userMemberships.length === 0) {
            const accessToken = await createAccessToken(tokenCreateUserData)
            const refreshToken = await createRefreshToken(user.id, '')

            return c.json(
                {
                    message: 'No group found. Logged in groupless mode.',
                    data: {
                        user: zSelectUserWithoutPass.parse(user),
                        group: undefined,
                        role: undefined,
                        accessToken,
                        refreshToken,
                        lastLogin: now.toISOString(),
                        expiresIn: expiresIn,
                    },
                    success: true,
                    error: null,
                    meta: null,
                },
                OK,
            )
        }

        // set default group id if not set
        if (!user.defaultGroupId) {
            await setDefaultGroupId(user.id, userMemberships[0].groupId)
        }
    }

    const group = await db.query.groupsTable.findFirst({
        where: eq(groupsTable.id, chosenGroupId),
    })

    if (group?.status === 'inactive') {
        return c.json(
            {
                data: {},
                message: 'This organization is not active',
                success: false,
                error: 'This organization is not active',
                meta: null,
            },
            FORBIDDEN,
        )
    }

    const role = await getRoleByUserAndGroup(user.id, chosenGroupId)
    const accessToken = await createAccessToken(
        tokenCreateUserData,
        role?.id ?? '',
        group as GroupDto,
    )
    const refreshToken = await createRefreshToken(user.id, chosenGroupId)

    return c.json(
        {
            message: 'User login to provided group was successful',
            data: {
                user: zSelectUserWithoutPass.parse(user),
                group: group ?? null,
                role: role ?? null,
                expiresIn: expiresIn,
                accessToken,
                refreshToken,
                lastLogin: now.toISOString(),
            },
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
