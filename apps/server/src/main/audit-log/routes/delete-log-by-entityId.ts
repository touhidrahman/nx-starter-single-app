import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { deleteLogByEntityId } from '../audit-log.service'

export const deleteLogByEntityIdRoute = createRoute({
    path: '/v1/logs/:entityId',
    method: 'delete',
    tags: ['Logs'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({ entityId: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Logs deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Logs not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteLogByEntityIdHandler: AppRouteHandler<
    typeof deleteLogByEntityIdRoute
> = async (c) => {
    const entityId = c.req.param('entityId')

    try {
        await deleteLogByEntityId(entityId)
        return c.json(
            { data: {}, message: 'Logs deleted successfully', success: true },
            OK,
        )
    } catch (error) {
        console.error(
            'Error deleting log:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        c.var.logger.error(error?.stack ?? error)
        return c.json(
            { data: {}, message: 'Failed to delete log', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
