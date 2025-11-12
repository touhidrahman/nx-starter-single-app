import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { BAD_REQUEST, FORBIDDEN, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { membershipsTable } from '../../../core/db/schema'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { DateUtil } from '../../../core/utils/date.util'
import { zSelectGroup } from '../../group/group.schema'
import { findGroupById } from '../../group/group.service'
import { zSelectRole } from '../../role/role.schema'
import { zSelectUserWithoutPass } from '../../user/user.schema'
import { setDefaultGroupId } from '../../user/user.service'
import { TokenCreateUserData, zLogin } from '../auth.schema'
import { findUser, getRoleByUserAndGroup } from '../auth.service'
import {
    ACCESS_TOKEN_LIFE,
    createAccessToken,
    createRefreshToken,
} from '../token.util'

const tags = ['Auth']

export const loginRoute = createRoute({
    path: '/v1/auth/login',
    method: 'post',
    tags,
    request: {
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
    const { username, password } = c.req.valid('json')

    const user = await findUser(username ?? '')

    if (!user) {
        return c.json(
            {
                message: 'Invalid username or password',
                data: {},
                success: false,
                meta: null,
            },
            BAD_REQUEST,
        )
    }

    const dateUtil = DateUtil
    const now = dateUtil.date()

    if (
        user.bannedAt &&
        dateUtil.isBefore(dateUtil.toJsDate(user.bannedAt), now)
    ) {
        return c.json(
            {
                message: 'Your account is locked. Please contact support.',
                data: {},
                success: false,
                meta: null,
            },
            FORBIDDEN,
        )
    }

    if (!(await argon2.verify(user.password, password))) {
        return c.json(
            {
                message: 'Invalid username or password',
                data: {},
                success: false,
                meta: null,
            },
            BAD_REQUEST,
        )
    }

    const tokenCreateUserData: TokenCreateUserData = {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        id: user.id,
    }

    const expiresIn = dateUtil.addSeconds(now, ACCESS_TOKEN_LIFE).toISOString()

    const chosenGroupId = user.defaultGroupId
    const group = await findGroupById(chosenGroupId ?? '')

    if (!group) {
        const userMemberships = await db.query.membershipsTable.findMany({
            where: eq(membershipsTable.userId, user.id),
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
    const role = await getRoleByUserAndGroup(user.id, group?.id ?? '')
    const accessToken = await createAccessToken(
        tokenCreateUserData,
        role?.id ?? '',
        group,
    )
    const refreshToken = await createRefreshToken(user.id, group?.id ?? '')

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
