import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { findGroupById, updateSubscriptionId } from '../../group/group.service'
import {
    InsertSubscription,
    zInsertSubscription,
    zSelectSubscription,
} from '../subscription.schema'
import {
    createSubscription,
    findSubscriptionByGroupId,
} from '../subscriptions.service'

export const createSubscriptionsRoute = createRoute({
    path: '/subscriptions',
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

        const activeSubscription = await findSubscriptionByGroupId(groupId)
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
        const newSubscription: InsertSubscription = {
            ...body,
            startDate: startDate,
        }
        const [subscription] = await createSubscription(newSubscription)

        const [updatedGroup] = await updateSubscriptionId(
            groupId,
            subscription.id,
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
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
