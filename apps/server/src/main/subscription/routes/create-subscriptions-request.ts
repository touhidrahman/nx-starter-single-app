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
import { findGroupById } from '../../group/group.service'
import {
    zInsertSubscriptionRequest,
    zSelectSubscriptionRequest,
} from '../subscription.schema'
import {
    createSubscriptionRequest,
    findSubscriptionRequestByGroupId,
} from '../subscriptions.service'

export const createSubscriptionsRequestRoute = createRoute({
    path: '/v1/subscriptions/request',
    method: 'post',
    tags: ['Subscriptions'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertSubscriptionRequest, 'Subscription details'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectSubscriptionRequest,
            'Subscription request created successfully',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid subscription data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const createSubscriptionsRequestHandler: AppRouteHandler<
    typeof createSubscriptionsRequestRoute
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

        const activeSubscription =
            await findSubscriptionRequestByGroupId(groupId)
        if (activeSubscription.length > 0) {
            return c.json(
                {
                    data: {},
                    message:
                        'An subscription request already exists for this group',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const [subscription] = await createSubscriptionRequest(body)

        await saveLog(
            'subscriptions',
            subscription.id,
            sub,
            'create',
            {},
            toJsonSafe(subscription),
        )

        await saveLog(
            'groups',
            groupId,
            sub,
            'update',
            toJsonSafe(group),
            toJsonSafe(group),
        )

        return c.json(
            {
                data: subscription,
                message: 'Subscription request created successfully',
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
                    error: error,
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
