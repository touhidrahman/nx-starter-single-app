import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { deleteUsersByIds } from '../user.service'

export const deleteUsersRoute = createRoute({
    path: '/v1/users/delete',
    method: 'delete',
    tags: ['User'],
    middleware: [checkToken, checkPermission(['user:delete'])] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'User IDs to delete',
        ),
    },
    responses: {
        [OK]: ApiResponse(z.object({}), 'Users deleted successfully'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteUsersHandler: AppRouteHandler<
    typeof deleteUsersRoute
> = async (c) => {
    try {
        const body = c.req.valid('json')
        const { sub } = c.get('jwtPayload')

        // Delete users by IDs

        for (const id of body.ids) {
            const result = await deleteUsersByIds(id)
            await saveLog('users', id, sub, 'delete', toJsonSafe(result), {})
        }

        return c.json(
            {
                data: {},
                message: 'Users deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to delete users',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
