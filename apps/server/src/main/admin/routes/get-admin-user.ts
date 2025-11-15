import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectAdmin } from '../admin.schema'
import { adminUserExists, getAdminUserById } from '../admin-user.service'

export const getAdminUserRoute = createRoute({
    path: '/admin/:id',
    method: 'get',
    tags: ['Admin'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdmin, 'Admin user found'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Admin user not found'),
    },
})

export const getAdminUserHandler: AppRouteHandler<
    typeof getAdminUserRoute
> = async (c) => {
    const userId = c.req.param('id')
    const userExists = await adminUserExists(userId)

    if (!userExists) {
        return c.json(
            { data: {}, message: 'Admin user not found', success: false },
            NOT_FOUND,
        )
    }

    const user = await getAdminUserById(userId)

    return c.json(
        { data: user, success: true, message: 'Admin user found' },
        OK,
    )
}
