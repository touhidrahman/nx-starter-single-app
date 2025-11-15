import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/token.util'
import {
    zInsertAccount,
    zQueryAccounts,
    zSelectAccount,
    zUpdateAccount,
} from '../base/account-base.model'
import { AccountCommonService } from './account-common.service'

const tags = [APP_OPENAPI_TAGS.ACCOUNT]
const path = '/accounts/common'

const getAccountListRoute = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryAccounts,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccount), 'List of Items'),
    },
})

const getAccountListHandler: AppRouteHandler<
    typeof getAccountListRoute
> = async (c) => {
    const { page, size, ...query } = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await AccountCommonService.findMany(groupSpecificQuery)
    const count = await AccountCommonService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(page, size, count),
            message: 'Account list fetched successfully',
            success: true,
        },
        OK,
    )
}

const getAccountRoute = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Item'),
    },
})

const getAccountHandler: AppRouteHandler<typeof getAccountRoute> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await AccountCommonService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Account not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Account fetched successfully',
            success: true,
        },
        OK,
    )
}

const createAccountRoute = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertAccount, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Item'),
    },
})

const createAccountHandler: AppRouteHandler<typeof createAccountRoute> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')
    const data = await AccountCommonService.create({ ...input, groupId })

    return c.json(
        {
            data,
            message: 'Account created successfully',
            success: true,
        },
        OK,
    )
}

const updateAccountRoute = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAccount, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Item'),
    },
})

const updateAccountHandler: AppRouteHandler<typeof updateAccountRoute> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await AccountCommonService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Account not found' })
    }

    const input = c.req.valid('json')
    const data = await AccountCommonService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Account updated successfully',
            success: true,
        },
        OK,
    )
}

const deleteAccountRoute = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const deleteAccountHandler: AppRouteHandler<typeof deleteAccountRoute> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await AccountCommonService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Account not found' })
    }
    await AccountCommonService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Account deleted successfully',
            success: true,
        },
        OK,
    )
}

export const accountCommonRoutes = createRouter()
    .openapi(getAccountListRoute, getAccountListHandler)
    .openapi(createAccountRoute, createAccountHandler)
    .openapi(updateAccountRoute, updateAccountHandler)
    .openapi(deleteAccountRoute, deleteAccountHandler)
    .openapi(getAccountRoute, getAccountHandler)
