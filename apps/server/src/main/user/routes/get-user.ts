import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectUser } from '../user.schema'
import { findUserById } from '../user.service'
import { passwordRemoved } from '../user.util'

export const getUserRoute = createRoute({
    path: '/users/:id',
    method: 'get',
    tags: ['User'],
    middleware: [checkToken, checkPermission(['user:read'])] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'User found'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const getUserHandler: AppRouteHandler<typeof getUserRoute> = async (c) => {
    const userId = c.req.param('id')
    const user = await findUserById(userId)

    if (!user) {
        return c.json({ data: {}, message: 'User not found', success: false }, NOT_FOUND)
    }

    return c.json({ data: passwordRemoved(user), message: 'User found', success: true }, OK)
}
