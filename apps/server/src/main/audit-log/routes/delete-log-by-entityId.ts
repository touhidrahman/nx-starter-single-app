import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
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
    },
})

export const deleteLogByEntityIdHandler: AppRouteHandler<
    typeof deleteLogByEntityIdRoute
> = async (c) => {
    const entityId = c.req.param('entityId')

    const res = await deleteLogByEntityId(entityId)
    if (!res) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Entity ID is invalid or no logs found',
        })
    }

    return c.json(
        { data: {}, message: 'Logs deleted successfully', success: true },
        OK,
    )
}
