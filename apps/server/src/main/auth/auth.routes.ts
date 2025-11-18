import { createRoute } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { attemptAsync } from 'es-toolkit'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { db } from '../../db/db'
import { groupsTable, membershipsTable } from '../../db/schema'
import { REQ_METHOD } from '../../models/common.values'
import { ApiResponse } from '../../utils/api-response.util'
import { GroupOwner } from '../claim/claims'
import { UserCustomService } from '../user/custom/user-custom.service'
import { zInsertUser } from '../user/user.schema'
import { AuthService } from './auth.service'
import { zUserLogin, zUserLoginResponse } from './auth.zod'
import { CryptoService } from './crypto.service'
import { createAccessToken2, createRefreshToken } from './token.util'

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

        const passwordHash = await CryptoService.hashPassword(input.password)

        const [error, user] = await attemptAsync(
            async () =>
                await UserCustomService.create({
                    ...input,
                    password: passwordHash,
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

        const accessToken = await createAccessToken2({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roleId: membership.roleId ?? '',
            groupId: group.id,
        })
        const refreshToken = await createRefreshToken(user.id, group.id)

        return c.json(
            {
                data: {
                    accessToken,
                    refreshToken,
                    lastLogin: new Date().toISOString(),
                    user: { ...user, password: '' },
                    role: role?.role,
                    group,
                },
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

export const authRoutes = createRouter()
    .openapi(LoginUserDef, LoginUser)
    .openapi(RegisterUserDef, RegisterUser)
