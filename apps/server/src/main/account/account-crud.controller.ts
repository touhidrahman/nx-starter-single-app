import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { checkToken } from '../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../core/middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../core/models/common.schema'
import { DEFAULT_PAGE_SIZE } from '../../core/models/common.values'
import {
    ApiListResponse,
    ApiResponse,
} from '../../core/utils/api-response.util'
import {
    zInsertAccount,
    zQueryAccounts,
    zSelectAccount,
    zUpdateAccount,
} from './account-crud.model'
import { AccountCrudService } from './account-crud.service'

export const adminGetAccountsRoute = createRoute({
    path: '/crud/accounts',
    tags: ['Account'],
    method: 'get',
    middleware: [checkToken, isAdmin] as const,
    request: {
        query: zQueryAccounts,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccount), 'List of Accounts'),
    },
})

export const adminGetAccountsHandler: AppRouteHandler<
    typeof adminGetAccountsRoute
> = async (c) => {
    const query = c.req.valid('query')
    const data = await AccountCrudService.findMany(query)
    const count = await AccountCrudService.count(query)

    return c.json(
        {
            data,
            pagination: {
                total: count,
                page: query.page || 1,
                size: query.size || DEFAULT_PAGE_SIZE,
                totalPages: Math.ceil(
                    count / (query.size || DEFAULT_PAGE_SIZE),
                ),
            },
            message: 'Account list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const adminGetAccountByIdRoute = createRoute({
    path: '/crud/accounts/:id',
    tags: ['Account'],
    method: 'get',
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Account details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Account not found'),
    },
})

export const adminGetAccountByIdHandler: AppRouteHandler<
    typeof adminGetAccountByIdRoute
> = async (c) => {
    const { id } = c.req.valid('param')
    const account = await AccountCrudService.findById(id)

    if (!account) {
        return c.json(
            {
                data: {},
                message: 'Account not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: account,
            message: 'Account details fetched successfully',
            success: true,
        },
        OK,
    )
}

export const adminCreateAccountRoute = createRoute({
    path: '/crud/accounts',
    tags: ['Account'],
    method: 'post',
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(zInsertAccount, 'Account Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAccount, 'Account created successfully'),
    },
})

export const adminCreateAccountHandler: AppRouteHandler<
    typeof adminCreateAccountRoute
> = async (c) => {
    const body = c.req.valid('json')
    const newAccount = await AccountCrudService.create(body)

    return c.json(
        {
            data: newAccount,
            message: 'Account created successfully',
            success: true,
        },
        CREATED,
    )
}

export const adminUpdateAccountRoute = createRoute({
    path: '/crud/accounts/:id',
    tags: ['Account'],
    method: 'put',
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAccount, 'Account Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Account updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Account not found'),
    },
})

export const adminUpdateAccountHandler: AppRouteHandler<
    typeof adminUpdateAccountRoute
> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingAccount = await AccountCrudService.findById(id)

    if (!existingAccount) {
        return c.json(
            {
                data: {},
                message: 'Account not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedAccount = await AccountCrudService.update(id, body)

    return c.json(
        {
            data: updatedAccount,
            message: 'Account updated successfully',
            success: true,
        },
        OK,
    )
}
