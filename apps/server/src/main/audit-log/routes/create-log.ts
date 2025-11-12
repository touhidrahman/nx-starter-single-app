import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
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
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
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

    try {
        const [log] = await createLog(logData)

        return c.json(
            {
                data: log,
                message: 'Case created successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    error: error.errors,
                    message: 'Invalid log data',
                    success: false,
                },
                BAD_REQUEST,
            )
        }
        console.error(
            'Error creating case:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        c.var.logger.error(error?.stack ?? error)
        return c.json(
            { data: {}, message: 'Failed to create log!', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
