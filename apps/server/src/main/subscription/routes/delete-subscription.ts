import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog } from '../../audit-log/audit-log.service'
import {
    deleteSubscriptionById,
    findSubscriptionById,
} from '../subscriptions.service'

export const deleteSubscriptionRoute = createRoute({
    path: '/v1/subscriptions/:id',
    method: 'delete',
    tags: ['Subscriptions'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Subscription deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteSubscriptionHandler: AppRouteHandler<
    typeof deleteSubscriptionRoute
> = async (c) => {
    const id = c.req.param('id')
    const payload = c.get('jwtPayload')

    try {
        const subscription = await findSubscriptionById(id)
        if (!subscription) {
            return c.json(
                { data: {}, message: 'Item not found', success: false },
                NOT_FOUND,
            )
        }

        await deleteSubscriptionById(id)

        await saveLog('subscriptions', id, payload.sub, 'delete', {}, {})

        return c.json(
            {
                data: {},
                message: 'Subscription deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
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
}
