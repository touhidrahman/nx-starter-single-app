import { createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { deleteLog, logExists } from '../audit-log.service'

export const deleteLogRoute = createRoute({
    path: '/v1/logs/:id',
    method: 'delete',
    tags: ['Logs'],
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Log deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Log not found'),
    },
})

export const deleteLogHandler: AppRouteHandler<typeof deleteLogRoute> = async (
    c,
) => {
    const id = c.req.param('id')

    try {
        const log = await logExists(id)
        if (!log) {
            return c.json(
                { data: {}, message: 'Log not found', success: false },
                NOT_FOUND,
            )
        }

        await deleteLog(id)
        return c.json(
            { data: {}, message: 'Log deleted successfully', success: true },
            OK,
        )
    } catch (error) {
        throw new HTTPException(INTERNAL_SERVER_ERROR, {
            message: 'Failed to delete log',
        })
    }
}
