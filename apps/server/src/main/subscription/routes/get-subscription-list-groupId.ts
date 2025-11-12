import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectSubscription } from '../subscription.schema'
import { findSubscriptionListByGroupId } from '../subscriptions.service'

export const getSubscriptionListByGroupIdRoute = createRoute({
    path: '/v1/subscriptions/group/subscription-list',
    tags: ['Subscriptions'],
    method: 'get',
    middleware: [checkToken, checkPermission(['subscription:read'])] as const,
    responses: {
        [OK]: ApiResponse(
            z.array(zSelectSubscription),
            'Subscription List details',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription list not found'),
    },
})

export const getSubscriptionListByGroupIdHandler: AppRouteHandler<
    typeof getSubscriptionListByGroupIdRoute
> = async (c) => {
    const { groupId } = await c.get('jwtPayload')
    const subscriptionList = await findSubscriptionListByGroupId(groupId)

    if (!subscriptionList) {
        return c.json(
            {
                data: {},
                message: 'Subscription list not found',
                success: false,
            },
            NOT_FOUND,
        )
    }
    return c.json(
        {
            data: subscriptionList,
            message: 'Subscription list details',
            success: true,
        },
        OK,
    )
}
