import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectSubscriptionRequest } from '../subscription.schema'
import {
    countSubscriptionRequest,
    getAllSubscriptionsRequest,
} from '../subscriptions.service'

export const getSubscriptionRequestListRoute = createRoute({
    path: '/v1/subscriptions/requests',
    tags: ['Subscriptions'],
    method: 'get',
    middleware: [checkToken, isAdmin] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            page: z.string().optional(),
            size: z.string().optional(),
            orderBy: z.string().optional(),
            plan: z.string().optional(),
            subscriptionType: z.string().optional(),
            status: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(
            z.array(zSelectSubscriptionRequest),
            'List of subscriptions request',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'No subscriptions request found!'),
    },
})

export const getSubscriptionRequestListHandler: AppRouteHandler<
    typeof getSubscriptionRequestListRoute
> = async (c) => {
    try {
        const { search, page, size, orderBy, plan, subscriptionType, status } =
            c.req.query()

        const pageNumber = Number(page)
        const limitNumber = Number(size)

        const { data, meta } = await getAllSubscriptionsRequest({
            search,
            page: pageNumber,
            size: limitNumber,
            orderBy,
            plan,
            subscriptionType,
            status,
        })

        const count = await countSubscriptionRequest()
        return c.json(
            {
                data: data,
                pagination: {
                    page: meta.page,
                    size: meta.size,
                    total: count,
                },
                message: 'Subscriptions request list',
                success: true,
            },
            OK,
        )
    } catch (error: any) {
        return c.json(
            { data: {}, message: error.message, success: false, error: error },
            NOT_FOUND,
        )
    }
}
