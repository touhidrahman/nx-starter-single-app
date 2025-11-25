import { createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { attemptAsync } from 'es-toolkit'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { db } from '../../db/db'
import { groupsTable, membershipsTable } from '../../db/schema'
import { sendEmailUsingResend } from '../../email/email.service'
import env from '../../env'
import { checkToken } from '../../middlewares/check-token.middleware'
import { REQ_METHOD } from '../../models/common.values'
import { ApiResponse } from '../../utils/api-response.util'
import { DateUtil } from '../../utils/date.util'
import { GroupOwner } from '../claim/claims'
import { buildWelcomeEmailTemplate } from '../email/templates/welcome'
import { GroupCustomService } from '../group/custom/group-custom.service'
import { UserCustomService } from '../user/custom/user-custom.service'
import { zInsertUser } from '../user/user.schema'
import { AuthService } from './auth.service'
import { zUserLogin, zUserLoginResponse } from './auth.zod'
import { createVerificationToken, decodeRefreshToken } from './token.util'

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

        const group = await GroupCustomService.create({
            name: `${user.firstName}'s Group ${user.id?.toUpperCase()}`,
        })
        const membership = await GroupCustomService.addGroupMember({
            groupId: group.id,
            userId: user.id,
            roleId: GroupOwner,
        })
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

        const email = user.email ?? ''
        if (email) {
            const [error, _] = await attemptAsync(async () => {
                const token = await createVerificationToken(
                    user.id,
                    {
                        unit: 'day',
                        value: 7,
                    },
                    email,
                )
                const welcomeEmail = buildWelcomeEmailTemplate({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email,
                    verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
                    groupName: group.name ?? '',
                })

                return sendEmailUsingResend(
                    [email],
                    'Please verify your email',
                    welcomeEmail,
                )
            })
        }

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

const GroupSwitchDef = createRoute({
    path: `${path}/group-switch/:groupId`,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        params: z.object({ groupId: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zUserLoginResponse, 'User logged in successfully'),
    },
})

const GroupSwitch: AppRouteHandler<typeof GroupSwitchDef> = async (c) => {
    const { sub: userId } = await c.get('jwtPayload')
    const groupId = c.req.param('groupId') ?? ''
    const data = await AuthService.getUserLoginResponseByUserIdAndGroupId(
        userId,
        groupId,
    )
    if (!data) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Could not switch organization',
        })
    }

    return c.json(
        {
            data,
            message: 'User logged in successfully',
            success: true,
        },
        OK,
    )
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
    const now = DateUtil.date()
    const expiresSoon = exp > DateUtil.addDays(now, -1).getTime()

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

export const authRoutes = createRouter()
    .openapi(LoginUserDef, LoginUser)
    .openapi(RegisterUserDef, RegisterUser)
    .openapi(GetNewTokenDef, GetNewToken)
    .openapi(GroupSwitchDef, GroupSwitch)
