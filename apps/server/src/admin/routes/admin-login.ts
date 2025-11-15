import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import type { AppRouteHandler } from '../../core/core.type'
import { zEmpty } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { DateUtil } from '../../utils/date.util'
import { getAdminUserByEmail } from '../admin-user.service'
import { zLogin } from '../auth/auth.schema'
import {
    createAdminAccessToken,
    createAdminRefreshToken,
} from '../auth/token.util'

const tags = ['Auth']

export const adminLoginRoute = createRoute({
    path: '/admin/login',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(zLogin, 'Admin login details'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                accessToken: z.string(),
                refreshToken: z.string(),
                lastLogin: z.string(),
            }),
            'Admin login successful',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid identifier or password'),
    },
})

export const adminLoginHandler: AppRouteHandler<
    typeof adminLoginRoute
> = async (c) => {
    const { username, password } = c.req.valid('json')

    const admin = await getAdminUserByEmail(username)

    if (!admin) {
        return c.json(
            {
                message: 'Invalid identifier or password',
                data: {},
                success: false,
            },
            BAD_REQUEST,
        )
    }

    const dateUtil = DateUtil
    const now = dateUtil.date()

    if (!(await argon2.verify(admin.password, password))) {
        return c.json(
            {
                message: 'Invalid identifier or password',
                data: {},
                success: false,
            },
            BAD_REQUEST,
        )
    }

    if (!admin.verifiedAt) {
        return c.json(
            { message: 'Please verify your account', data: {}, success: false },
            BAD_REQUEST,
        )
    }

    const accessToken = await createAdminAccessToken(admin)
    const refreshToken = await createAdminRefreshToken(admin)

    return c.json(
        {
            message: 'Admin login successful',
            data: {
                accessToken,
                refreshToken,
                lastLogin: now.toISOString(),
            },
            success: true,
        },
        OK,
    )
}
