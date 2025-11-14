import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectUser, zUpdateUser } from '../user.schema'
import { updateUser } from '../user.service'
import { passwordRemoved } from '../user.util'

export const updateUserRoute = createRoute({
    path: '/v1/user/:id',
    method: 'put',
    tags: ['User'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zUpdateUser, 'User details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Updated'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const updateUserHandler: AppRouteHandler<
    typeof updateUserRoute
> = async (c) => {
    const body = c.req.valid('json')
    const userId = c.req.param('id')
    const { sub } = c.get('jwtPayload')

    const [updatedUser] = await updateUser(userId, body)

    if (!updatedUser) {
        return c.json(
            { data: {}, message: 'User not found', success: false },
            NOT_FOUND,
        )
    }
    const removedPassword = await passwordRemoved(updatedUser)

    await saveLog(
        'user',
        userId,
        sub,
        'update',
        {},
        toJsonSafe(updatedUser ?? {}),
    )

    return c.json(
        {
            data: removedPassword,
            message: 'User updated',
            success: true,
        },
        OK,
    )
}
