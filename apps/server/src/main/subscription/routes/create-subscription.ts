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
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { findGroupById, updateSubscriptionId } from '../../group/group.service'
import {
    zInsertSubscription,
    zSelectSubscription,
} from '../subscription.schema'
import {
    createSubscription,
    findActiveSubscriptionByGroupId,
} from '../subscriptions.service'

export const createSubscriptionsRoute = createRoute({
    path: '/v1/subscriptions',
    method: 'post',
    tags: ['Subscriptions'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertSubscription, 'Subscription details'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectSubscription,
            'Subscription created successfully',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid subscription data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const createSubscriptionsHandler: AppRouteHandler<
    typeof createSubscriptionsRoute
> = async (c) => {
    const body = c.req.valid('json')
    const { sub } = c.get('jwtPayload')
    const groupId = body.groupId as string
    const subscriptionType = body.subscriptionType as 'monthly' | 'yearly'

    if (!groupId) {
        return c.json(
            {
                data: {},
                message: 'groupId is required',
                success: false,
            },
            BAD_REQUEST,
        )
    }
    try {
        const group = await findGroupById(groupId)
        if (!group) {
            return c.json(
                {
                    data: {},
                    message: 'Group does not exist',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const activeSubscription =
            await findActiveSubscriptionByGroupId(groupId)
        if (activeSubscription.length > 0) {
            return c.json(
                {
                    data: {},
                    message:
                        'An active subscription already exists for this group',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const startDate = new Date()
        let endDate: Date

        if (subscriptionType === 'monthly') {
            endDate = new Date(startDate)
            endDate.setMonth(startDate.getMonth() + 1)
        } else if (subscriptionType === 'yearly') {
            endDate = new Date(startDate)
            endDate.setFullYear(startDate.getFullYear() + 1)
        } else {
            return c.json(
                {
                    data: {},
                    message: 'Invalid subscriptionType ',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const newSubscription = {
            ...body,
            startDate: startDate,
            endDate: endDate,
        }
        const [subscription] = await createSubscription(newSubscription)

        await saveLog(
            'subscriptions',
            subscription.id,
            sub,
            'create',
            {},
            toJsonSafe(subscription),
        )

        const [updatedGroup] = await updateSubscriptionId(
            groupId,
            subscription.id,
        )

        await saveLog(
            'groups',
            groupId,
            sub,
            'update',
            toJsonSafe(group),
            toJsonSafe(updatedGroup),
        )

        return c.json(
            {
                data: subscription,
                message: 'Subscription created successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    message: 'Bad request',
                    success: false,
                    error: error.errors,
                },
                BAD_REQUEST,
            )
        }
        c.var.logger.error(error?.stack ?? error)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
