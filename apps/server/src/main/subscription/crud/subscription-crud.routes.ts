import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertSubscription,
    zQuerySubscriptions,
    zSelectSubscription,
} from '../core/subscription-core.model'
import { zSubscriptionWithPlan } from './subscription-crud.model'
import { SubscriptionCrudService } from './subscription-crud.service'

const tags = [APP_OPENAPI_TAGS.Subscription]
const path = '/crud/subscriptions'

const GetSubscriptionListCrudDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Subscription:Read'])] as const,
    request: { query: zQuerySubscriptions },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectSubscription), 'Subscription List'),
    },
})

const GetSubscriptionListCrud: AppRouteHandler<typeof GetSubscriptionListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const data = await SubscriptionCrudService.findMany({ ...query, groupId })
    const count = await SubscriptionCrudService.count({ ...query, groupId })

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

const GetSubscriptionCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Subscription:Read'])] as const,
    request: { params: zId },
    responses: { [OK]: ApiResponse(zSubscriptionWithPlan, 'Subscription') },
})

const GetSubscriptionCrud: AppRouteHandler<typeof GetSubscriptionCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    if (!groupId) {
        throw new HTTPException(FORBIDDEN, { message: 'Access denied' })
    }
    const existing = await SubscriptionCrudService.findOne({ groupId, id })
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'Subscription not found',
        })
    }
    return c.json({ data: existing, message: 'Subscription fetched', success: true }, OK)
}

const PostSubscriptionCrudDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Subscription:Write'])] as const,
    request: { body: jsonContent(zInsertSubscription, 'Subscription payload') },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription created'),
    },
})

const PostSubscriptionCrud: AppRouteHandler<typeof PostSubscriptionCrudDef> = async (c) => {
    const body = c.req.valid('json')
    const { groupId, sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload
    if (!groupId) {
        throw new HTTPException(FORBIDDEN, { message: 'Access denied' })
    }
    try {
        const data = await SubscriptionCrudService.create({
            ...body,
            groupId,
            creatorId,
        })
        return c.json(
            {
                data,
                message: 'Subscription created successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(INTERNAL_SERVER_ERROR, {
            message: 'Failed to create subscription',
        })
    }
}

export const subscriptionCrudRoutes = createRouter()
    .openapi(GetSubscriptionListCrudDef, GetSubscriptionListCrud)
    .openapi(GetSubscriptionCrudDef, GetSubscriptionCrud)
    .openapi(PostSubscriptionCrudDef, PostSubscriptionCrud)
