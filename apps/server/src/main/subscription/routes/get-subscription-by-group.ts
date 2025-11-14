import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectSubscription } from '../subscription.schema'
import { findSubscriptionByGroupId } from '../subscriptions.service'

export const getSubscriptionByGroupIdRoute = createRoute({
    path: '/v1/subscriptions/by-group/:groupId',
    tags: ['Subscriptions'],
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        params: z.object({ groupId: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

export const getSubscriptionByGroupIdHandler: AppRouteHandler<
    typeof getSubscriptionByGroupIdRoute
> = async (c) => {
    const groupId = c.req.param('groupId')
    const [subscription] = await findSubscriptionByGroupId(groupId)

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
