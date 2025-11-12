import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import {
    removeSubscriptionIdFromGroup,
    updateSubscriptionId,
} from '../../group/group.service'
import {
    InsertSubscription,
    InsertSubscriptionRequest,
    zUpdateSubscriptionRequest,
    zUpdateSubscriptionRequests,
} from '../subscription.schema'
import {
    calculateEndDate,
    createSubscription,
    findActiveSubscriptionByGroupId,
    findSubscriptionRequestByGroupIdAndId,
    inactiveActiveSubscription,
    updateSubscriptionRequestStatus,
} from '../subscriptions.service'

export const approveSubscriptionRequestRoute = createRoute({
    path: '/v1/subscriptions/request',
    tags: ['Subscriptions'],
    method: 'put',
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(
            zUpdateSubscriptionRequest,
            'subscription request approved',
        ),
    },
    responses: {
        [OK]: ApiResponse(zUpdateSubscriptionRequests, 'Subscription details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

export const approveSubscriptionRequestHandler: AppRouteHandler<
    typeof approveSubscriptionRequestRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')
    const [subscription] = await findActiveSubscriptionByGroupId(body.groupId)

    if (!subscription) {
        return c.json(
            {
                data: {},
                message: 'Subscription not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const requestedSubscription = await findSubscriptionRequestByGroupIdAndId(
        body.groupId,
        body.id,
    )

    if (!requestedSubscription) {
        return c.json(
            {
                data: {},
                message: 'Subscription request not found',
                success: false,
            },
            NOT_FOUND,
        )
    }
    const subscriptionType = requestedSubscription.subscriptionType as
        | 'monthly'
        | 'yearly'
    if (subscriptionType !== 'monthly' && subscriptionType !== 'yearly') {
        return c.json(
            {
                data: {},
                message: 'Invalid subscriptionType ',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await inactiveActiveSubscription(body.groupId)
    await removeSubscriptionIdFromGroup(body.groupId)

    const startDate = new Date()
    const endDate = calculateEndDate(startDate, subscriptionType)

    const newSubscriptionData: InsertSubscription = {
        status: 'active',
        subscriptionType: subscriptionType,
        planId: requestedSubscription.planId,
        groupId: requestedSubscription.groupId,
        isTrial: requestedSubscription.isTrial,
        autoRenewal: requestedSubscription.autoRenewal,
        startDate,
        endDate,
        usedStorage: 0,
    }

    const [newSubscription] = await createSubscription(newSubscriptionData)
    await updateSubscriptionId(newSubscription.groupId, newSubscription.id)
    await updateSubscriptionRequestStatus(requestedSubscription.id, 'approved')

    const updatedRequestedSubscription: InsertSubscriptionRequest = {
        ...requestedSubscription,
        status: 'approved' as const,
        statusChangeDate: new Date().toISOString(),
    }

    await saveLog(
        'subscriptions',
        subscription.id,
        payload.sub,
        'update',
        toJsonSafe(subscription),
        toJsonSafe(updatedRequestedSubscription),
    )

    return c.json(
        {
            data: updatedRequestedSubscription,
            message: 'Subscription details',
            success: true,
        },
        OK,
    )
}
