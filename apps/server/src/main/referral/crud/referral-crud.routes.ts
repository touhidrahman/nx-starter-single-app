import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertReferral,
    zQueryReferrals,
    zSelectReferral,
    zUpdateReferral,
} from '../core/referral-core.model'
import { ReferralCrudService } from './referral-crud.service'

const tags = [APP_OPENAPI_TAGS.Referral]
const path = '/crud/referrals'

const GetReferralListCrudDef = createRoute({
    path: path,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Referral:Read'])] as const,
    request: {
        query: zQueryReferrals,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectReferral), 'Referral List'),
    },
})

const GetReferralListCrud: AppRouteHandler<
    typeof GetReferralListCrudDef
> = async (c) => {
    const query = c.req.valid('query')
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const data = await ReferralCrudService.findManyForUser(query, userId)
    const count = await ReferralCrudService.countForUser(query, userId)

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

const GetReferralCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Referral:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectReferral, 'Item'),
    },
})

const GetReferralCrud: AppRouteHandler<typeof GetReferralCrudDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Referral not found' })
    }

    const existing = await ReferralCrudService.findByIdForUser(id, groupId)

    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Referral not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Referral fetched successfully',
            success: true,
        },
        OK,
    )
}

const PostReferralCrudDef = createRoute({
    path: path,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Referral:Write'])] as const,
    request: {
        body: jsonContent(zInsertReferral, 'Referral payload'),
    },
    responses: {
        [OK]: ApiResponse(zSelectReferral, 'Referral created'),
    },
})

const PostReferralCrud: AppRouteHandler<typeof PostReferralCrudDef> = async (
    c,
) => {
    const body = c.req.valid('json')
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload

    const data = await ReferralCrudService.createForUser(body, userId)

    return c.json(
        {
            data,
            message: 'Referral created successfully',
            success: true,
        },
        OK,
    )
}

const PutReferralCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware: [checkToken, checkPermission(['Referral:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateReferral, 'Referral payload'),
    },
    responses: {
        [OK]: ApiResponse(zSelectReferral, 'Referral updated'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Forbidden'),
    },
})

const PutReferralCrud: AppRouteHandler<typeof PutReferralCrudDef> = async (
    c,
) => {
    const body = c.req.valid('json')
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await ReferralCrudService.findByIdForUser(id, userId)

    if (!existing) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Referral not found or access denied',
        })
    }

    const data = await ReferralCrudService.updateForUser(id, body, userId)
    if (!data) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Referral could not be updated',
        })
    }

    return c.json(
        {
            data,
            message: 'Referral updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteReferralCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware: [checkToken, checkPermission(['Referral:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Referral deleted'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Forbidden'),
    },
})

const DeleteReferralCrud: AppRouteHandler<
    typeof DeleteReferralCrudDef
> = async (c) => {
    const id = c.req.valid('param').id
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload

    const existing = await ReferralCrudService.findByIdForUser(id, userId)

    if (!existing) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Referral not found or access denied',
        })
    }

    await ReferralCrudService.deleteForUser(id, userId)

    return c.json(
        {
            data: {},
            message: 'Referral deleted successfully',
            success: true,
        },
        OK,
    )
}

export const referralCrudRoutes = createRouter()
    .openapi(GetReferralListCrudDef, GetReferralListCrud)
    .openapi(GetReferralCrudDef, GetReferralCrud)
    .openapi(PostReferralCrudDef, PostReferralCrud)
    .openapi(PutReferralCrudDef, PutReferralCrud)
    .openapi(DeleteReferralCrudDef, DeleteReferralCrud)
