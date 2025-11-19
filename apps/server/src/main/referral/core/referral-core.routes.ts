import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertReferral,
    zQueryReferrals,
    zSelectReferral,
    zUpdateReferral,
} from './referral-core.model'
import { ReferralCoreService } from './referral-core.service'

const tags = [APP_OPENAPI_TAGS.Referral]
const path = '/core/referrals'
const middleware = undefined

const GetReferralListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: {
        query: zQueryReferrals,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectReferral), 'Referral List'),
    },
})

const GetReferralListCore: AppRouteHandler<
    typeof GetReferralListCoreDef
> = async (c) => {
    const query = c.req.valid('query')
    const data = await ReferralCoreService.findMany(query)
    const count = await ReferralCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Referral list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetReferralByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectReferral, 'Referral'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Referral not found'),
    },
})

const GetReferralByIdCore: AppRouteHandler<
    typeof GetReferralByIdCoreDef
> = async (c) => {
    const id = c.req.valid('param').id
    const data = await ReferralCoreService.findById(id)

    if (!data) {
        throw new HTTPException(NOT_FOUND, { message: 'Referral not found' })
    }

    return c.json({ data, message: 'Referral fetched', success: true }, OK)
}

const PostReferralCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: {
        body: jsonContent(zInsertReferral, 'Referral payload'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectReferral, 'Referral created'),
    },
})

const PostReferralCore: AppRouteHandler<typeof PostReferralCoreDef> = async (
    c,
) => {
    const body = c.req.valid('json')
    const data = await ReferralCoreService.create(body)

    return c.json(
        { data, message: 'Referral created successfully', success: true },
        CREATED,
    )
}

const PutReferralCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateReferral, 'Referral payload'),
    },
    responses: {
        [OK]: ApiResponse(zSelectReferral, 'Referral updated'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Referral not found'),
    },
})

const PutReferralCore: AppRouteHandler<typeof PutReferralCoreDef> = async (
    c,
) => {
    const id = c.req.valid('param').id
    const body = c.req.valid('json')

    const existing = await ReferralCoreService.exists(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Referral not found' })
    }

    const data = await ReferralCoreService.update(id, body)

    return c.json(
        { data, message: 'Referral updated successfully', success: true },
        OK,
    )
}

const DeleteReferralCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Referral deleted'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Referral not found'),
    },
})

const DeleteReferralCore: AppRouteHandler<
    typeof DeleteReferralCoreDef
> = async (c) => {
    const id = c.req.valid('param').id

    const existing = await ReferralCoreService.exists(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Referral not found' })
    }

    await ReferralCoreService.delete(id)

    return c.json(
        { data: {}, message: 'Referral deleted successfully', success: true },
        OK,
    )
}

export const referralCoreRoutes = createRouter()
    .openapi(GetReferralListCoreDef, GetReferralListCore)
    .openapi(GetReferralByIdCoreDef, GetReferralByIdCore)
    .openapi(PostReferralCoreDef, PostReferralCore)
    .openapi(PutReferralCoreDef, PutReferralCore)
    .openapi(DeleteReferralCoreDef, DeleteReferralCore)
