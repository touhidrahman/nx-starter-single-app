import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { checkToken } from '../../middlewares/check-token.middleware'
import { isAdmin } from '../../middlewares/is-admin.middleware'
import { zEmpty } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { zInsertAdmin, zSelectAdminWithoutPassword } from '../admin.schema'
import { createAdminUser } from '../admin-user.service'

export const createAdminRoute = createRoute({
    path: '/admin',
    method: 'post',
    tags: ['Admin'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(zInsertAdmin, 'Admin user'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdminWithoutPassword, 'Admin account created'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const createAdminHandler: AppRouteHandler<
    typeof createAdminRoute
> = async (c) => {
    const user = c.req.valid('json')
    const hash = await argon2.hash(user.password)

    try {
        const response = await createAdminUser({ ...user, password: hash })

        return c.json(
            {
                data: { ...response, password: '' },
                message: 'Admin created',
                success: true,
            },
            OK,
        )
    } catch (error) {
        c.var.logger.error(
            (error as Error)?.stack ?? error,
            'Error creating admin user',
        )
        return c.json(
            {
                data: {},
                message: 'Internal server error',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
