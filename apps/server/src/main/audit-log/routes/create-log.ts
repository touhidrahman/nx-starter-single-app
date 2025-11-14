import { createRoute } from '@hono/zod-openapi'
import { BAD_REQUEST, CREATED } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zInsertLog, zSelectLog } from '../audit-log.schema'
import { createLog } from '../audit-log.service'

export const createLogRoute = createRoute({
    path: '/v1/logs',
    method: 'post',
    tags: ['Logs'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertLog, 'Log details'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectLog, 'Log created successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid log data'),
    },
})

export const createLogHandler: AppRouteHandler<typeof createLogRoute> = async (
    c,
) => {
    const body = c.req.valid('json')
    const { sub } = await c.get('jwtPayload')

    const logData = {
        ...body,
        creatorId: sub,
    }

    const [log] = await createLog(logData)

    return c.json(
        {
            data: log,
            message: 'Log created successfully',
            success: true,
        },
        CREATED,
    )
}
