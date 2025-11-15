import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectSubscription } from '../subscription.schema'
import {
    countSubscription,
    getAllSubscriptions,
} from '../subscriptions.service'

export const getSubscriptionListRoute = createRoute({
    path: '/subscriptions',
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
        }),
    },
    responses: {
        [OK]: ApiResponse(
            z.array(zSelectSubscription),
            'List of subscriptions',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'No subscriptions found!'),
    },
})

export const getSubscriptionListHandler: AppRouteHandler<
    typeof getSubscriptionListRoute
> = async (c) => {
    try {
        const { search, page, size, orderBy, plan } = c.req.query()

        const pageNumber = Number(page)
        const limitNumber = Number(size)

        const { data, meta } = await getAllSubscriptions({
            search,
            page: pageNumber,
            size: limitNumber,
            orderBy,
            plan,
        })

        const count = await countSubscription()
        return c.json(
            {
                data: data,
                pagination: {
                    page: meta.page,
                    size: meta.size,
                    total: count,
                },
                message: 'Subscription list',
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
