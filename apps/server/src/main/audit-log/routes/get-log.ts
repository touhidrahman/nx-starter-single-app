import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectLog } from '../audit-log.schema'
import { findLogById } from '../audit-log.service'

export const getLogRoute = createRoute({
    path: '/logs/:id',
    method: 'get',
    tags: ['Logs'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectLog, 'Log found'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Log not found'),
    },
})

export const getLogHandler: AppRouteHandler<typeof getLogRoute> = async (c) => {
    const id = c.req.param('id')
    const log = await findLogById(id)

    if (!log) {
        return c.json(
            { data: {}, message: 'Log not found', success: false },
            NOT_FOUND,
        )
    }

    return c.json({ data: log, message: 'Log found', success: true }, OK)
}
