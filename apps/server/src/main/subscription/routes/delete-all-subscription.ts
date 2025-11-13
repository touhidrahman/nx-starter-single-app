import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog } from '../../audit-log/audit-log.service'
import { deleteManyByIds } from '../subscriptions.service'

export const deleteAllSubscriptionRoute = createRoute({
    path: '/v1/subscriptions',
    method: 'delete',
    tags: ['Subscriptions'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'Subscriptions ids details',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Subscriptions deleted successfully'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteAllSubscriptionHandler: AppRouteHandler<
    typeof deleteAllSubscriptionRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = c.get('jwtPayload')

    try {
        await deleteManyByIds(body.ids, payload.groupId)
        for (const id of body.ids) {
            await saveLog('subscriptions', id, payload.sub, 'delete', {}, {})
        }
    } catch (error) {
        console.error(
            'Error deleting subscriptions:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            {
                data: {},
                message: 'Internal Server Error',
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
    return c.json(
        {
            data: {},
            message: 'Subscriptions deleted successfully',
            success: true,
        },
        OK,
    )
}
