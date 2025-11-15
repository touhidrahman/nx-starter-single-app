import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectSubscription } from '../subscription.schema'
import { findSubscriptionById } from '../subscriptions.service'

export const getSubscriptionRoute = createRoute({
    path: '/subscriptions/:id',
    tags: ['Subscriptions'],
    method: 'get',
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

export const getSubscriptionHandler: AppRouteHandler<
    typeof getSubscriptionRoute
> = async (c) => {
    const id = c.req.param('id')
    const subscription = await findSubscriptionById(id)

    if (!subscription) {
        return c.json(
            { data: {}, message: 'Subscription not found', success: false },
            NOT_FOUND,
        )
    }
    return c.json(
        { data: subscription, message: 'Subscription details', success: true },
        OK,
    )
}
