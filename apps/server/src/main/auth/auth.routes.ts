import { createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { attemptAsync } from 'es-toolkit'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { isExpiringInDays } from '../../auth/auth.service'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { db } from '../../db/db'
import { groupsTable, membershipsTable } from '../../db/schema'
import { checkToken } from '../../middlewares/check-token.middleware'
import { REQ_METHOD } from '../../models/common.values'
import { ApiResponse } from '../../utils/api-response.util'
import { GroupOwner } from '../claim/claims'
import { addUserToGroup, findGroupById } from '../group/group.service'
import {
    checkGroupLimit,
    deleteInvitation,
    findInvitationById,
} from '../invite/invite.service'
import { UserCrudService } from '../user/crud/user-crud.service'
import { UserCustomService } from '../user/custom/user-custom.service'
import { zInsertUser } from '../user/user.schema'
import { setDefaultGroupId } from '../user/user.service'
import { AuthService } from './auth.service'
import { zAcceptInvite, zUserLogin, zUserLoginResponse } from './auth.zod'
import { decodeInvitationToken, decodeRefreshToken } from './token.util'

const tags = ['Auth']
const path = '/auth'

const LoginUserDef = createRoute({
    path: `${path}/login`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContentRequired(zUserLogin, 'User Login Data'),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'User logged in successfully'),
    },
})

const LoginUser: AppRouteHandler<typeof LoginUserDef> = async (c) => {
    try {
        const input = c.req.valid('json')
        const data = await AuthService.login(input.username, input.password)

        return c.json(
            {
                data,
                message: 'User logged in successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(BAD_REQUEST, {
            message: (error as Error).message,
        })
    }
}

const RegisterUserDef = createRoute({
    path: `${path}/register`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContentRequired(zInsertUser, 'User Registration Data'),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'User registered successfully'),
    },
})

const RegisterUser: AppRouteHandler<typeof RegisterUserDef> = async (c) => {
    try {
        const input = c.req.valid('json')

        const exists = await UserCustomService.findOne({
            username: input.username,
        })
        if (exists) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'User with the given username already exists',
            })
        }

        const [error, user] = await attemptAsync(
            async () =>
                await UserCustomService.create({
                    ...input,
                }),
        )
        if (error || !user?.id) {
            throw new HTTPException(BAD_REQUEST, {
                message: (error as Error).message,
            })
        }

        const [group] = await db
            .insert(groupsTable)
            .values({
                name: `${user.firstName}'s Group ${user.id?.toUpperCase()}`,
            })
            .returning()
        const [membership] = await db
            .insert(membershipsTable)
            .values({
                userId: user?.id,
                groupId: group.id,
                roleId: GroupOwner,
            })
            .returning()
        const role = await db.query.membershipsTable.findFirst({
            with: { role: true },
            where: eq(membershipsTable.roleId, membership.roleId ?? ''),
        })
        await UserCustomService.update(user.id, {
            defaultGroupId: group.id,
        })

        const data = await AuthService.getUserLoginResponse(
            user,
            group,
            role?.role ?? null,
        )

        return c.json(
            {
                data: data,
                message: 'User registered successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(BAD_REQUEST, {
            message: (error as Error).message,
        })
    }
}

const GetNewTokenDef = createRoute({
    path: `${path}/new-token`,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContentRequired(
            z.object({ refreshToken: z.string() }),
            'Refresh token',
        ),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'User logged in successfully'),
    },
})

const GetNewToken: AppRouteHandler<typeof GetNewTokenDef> = async (c) => {
    const { refreshToken: incomingRefreshToken } = c.req.valid('json')
    const decoded = await decodeRefreshToken(incomingRefreshToken)
    if (!decoded) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Invalid or expired refresh token',
        })
    }

    const { sub, level, groupId, exp } = decoded
    const expiresSoon = isExpiringInDays(exp, -1)

    // if (level === 'admin') {
    //     const admin = await AdminCustomService.findById(sub)
    //     if (!admin) {
    //         return c.json(
    //             { message: 'Admin not found', data: {}, success: false },
    //             BAD_REQUEST,
    //         )
    //     }

    //     const refreshToken = expiresSoon
    //         ? await createAdminRefreshToken(admin)
    //         : incomingRefreshToken

    //     const accessToken = await createAdminAccessToken(admin)
    //     userData = buildAdminPayload(admin)
    // }

    const data = await AuthService.getUserLoginResponseByUserIdAndGroupId(
        sub,
        groupId,
    )

    if (!data) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'User not found',
        })
    }

    const refreshToken = expiresSoon ? null : incomingRefreshToken

    return c.json(
        {
            data: {
                ...data,
                // send the old refresh token if not expiring soon
                refreshToken:
                    refreshToken === null ? data?.refreshToken : refreshToken,
            },
            message: 'New token generated',
            success: true,
        },
        OK,
    )
}

const AcceptInviteDef = createRoute({
    path: `${path}/accept-invite`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContentRequired(zAcceptInvite, 'Accept Invite Data'),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'User logged in successfully'),
    },
})

const AcceptInvite: AppRouteHandler<typeof AcceptInviteDef> = async (c) => {
    const payload = c.req.valid('json')
    const { token, password, firstName, lastName, username } = payload

    const decoded = await decodeInvitationToken(token)

    if (!decoded) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Invalid token!',
        })
    }

    const invite = await findInvitationById(decoded.invitationId)
    if (!invite) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Invitation not found!',
        })
    }

    const group = await findGroupById(decoded.organizationId)
    if (!group) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Organization not found!',
        })
    }

    const existsUsername = await UserCustomService.findOne({
        username: username,
    })
    const existsEmail = await UserCustomService.findOne({
        email: invite.email,
    })
    const exists = existsUsername || existsEmail
    if (exists) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'User with the given username or email already exists',
        })
    }

    const limitCheck = await checkGroupLimit(decoded.organizationId, {
        countSource: 'users',
    })

    if (!limitCheck.canAdd) {
        throw new HTTPException(BAD_REQUEST, {
            message: limitCheck.message || 'User limit reached for the group',
        })
    }

    const user = await UserCrudService.create({
        username,
        password,
        firstName,
        lastName,
        email: invite.email,
    })

    await addUserToGroup(user.id, decoded.organizationId, decoded.roleId)
    await setDefaultGroupId(user.id, decoded.organizationId)
    await deleteInvitation(decoded.invitationId)
    const role = await db.query.membershipsTable.findFirst({
        with: { role: true },
        where: eq(membershipsTable.userId, user.id),
    })

    const data = await AuthService.getUserLoginResponse(
        user,
        group,
        role?.role ?? null,
    )

    return c.json(
        {
            data,
            message: 'User registered successfully',
            success: true,
        },
        OK,
    )
}

export const authRoutes = createRouter()
    .openapi(LoginUserDef, LoginUser)
    .openapi(RegisterUserDef, RegisterUser)
    .openapi(GetNewTokenDef, GetNewToken)
    .openapi(AcceptInviteDef, AcceptInvite)
