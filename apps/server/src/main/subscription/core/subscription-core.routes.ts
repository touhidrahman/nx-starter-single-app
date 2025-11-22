import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertSubscription,
    zQuerySubscriptions,
    zSelectSubscription,
    zUpdateSubscription,
} from './subscription-core.model'
import { SubscriptionCoreService } from './subscription-core.service'

const tags = [APP_OPENAPI_TAGS.Subscription]
const path = '/core/subscriptions'
const middleware = undefined

const GetSubscriptionListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: { query: zQuerySubscriptions },
    responses: {
        [OK]: ApiListResponse(
            z.array(zSelectSubscription),
            'Subscription List',
        ),
    },
})

const GetSubscriptionListCore: AppRouteHandler<
    typeof GetSubscriptionListCoreDef
> = async (c) => {
    const query = c.req.valid('query')
    const data = await SubscriptionCoreService.findMany(query)
    const count = await SubscriptionCoreService.count(query)
    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Subscription list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetSubscriptionByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: { params: zId },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

const GetSubscriptionByIdCore: AppRouteHandler<
    typeof GetSubscriptionByIdCoreDef
> = async (c) => {
    const id = c.req.valid('param').id
    const data = await SubscriptionCoreService.findById(id)
    if (!data) {
        return c.json(
            { data: {}, message: 'Subscription not found', success: false },
            NOT_FOUND,
        )
    }
    return c.json({ data, message: 'Subscription fetched', success: true }, OK)
}

const PostSubscriptionCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: { body: jsonContent(zInsertSubscription, 'Subscription payload') },
    responses: {
        [CREATED]: ApiResponse(zSelectSubscription, 'Subscription created'),
    },
})

const PostSubscriptionCore: AppRouteHandler<
    typeof PostSubscriptionCoreDef
> = async (c) => {
    const body = c.req.valid('json')
    const data = await SubscriptionCoreService.create(body)
    return c.json(
        { data, message: 'Subscription created successfully', success: true },
        CREATED,
    )
}

const PutSubscriptionCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateSubscription, 'Subscription payload'),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription updated'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

const PutSubscriptionCore: AppRouteHandler<
    typeof PutSubscriptionCoreDef
> = async (c) => {
    const id = c.req.valid('param').id
    const body = c.req.valid('json')
    const exists = await SubscriptionCoreService.exists(id)
    if (!exists) {
        return c.json(
            { data: {}, message: 'Subscription not found', success: false },
            NOT_FOUND,
        )
    }
    const data = await SubscriptionCoreService.update(id, body)
    return c.json(
        { data, message: 'Subscription updated successfully', success: true },
        OK,
    )
}

const DeleteSubscriptionCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: { params: zId },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Subscription deleted'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

const DeleteSubscriptionCore: AppRouteHandler<
    typeof DeleteSubscriptionCoreDef
> = async (c) => {
    const id = c.req.valid('param').id
    const exists = await SubscriptionCoreService.exists(id)
    if (!exists) {
        return c.json(
            { data: {}, message: 'Subscription not found', success: false },
            NOT_FOUND,
        )
    }
    await SubscriptionCoreService.delete(id)
    return c.json(
        {
            data: {},
            message: 'Subscription deleted successfully',
            success: true,
        },
        OK,
    )
}

export const subscriptionCoreRoutes = createRouter()
    .openapi(GetSubscriptionListCoreDef, GetSubscriptionListCore)
    .openapi(GetSubscriptionByIdCoreDef, GetSubscriptionByIdCore)
    .openapi(PostSubscriptionCoreDef, PostSubscriptionCore)
    .openapi(PutSubscriptionCoreDef, PutSubscriptionCore)
    .openapi(DeleteSubscriptionCoreDef, DeleteSubscriptionCore)
