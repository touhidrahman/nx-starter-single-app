import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../core/middlewares/is-admin.middleware'
import { zEmpty, zId, zIds } from '../../core/models/common.schema'
import {
    APP_OPENAPI_TAGS,
    DEFAULT_PAGE_SIZE,
    REQ_METHOD,
} from '../../core/models/common.values'
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

const tags = [APP_OPENAPI_TAGS.ACCOUNT]
const middleware = undefined // [checkToken, isAdmin]

const crudGetAccountsRoute = createRoute({
    path: '/crud/accounts',
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryAccounts,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccount), 'List of Accounts'),
    },
})

const crudGetAccountsHandler: AppRouteHandler<
    typeof crudGetAccountsRoute
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

const crudGetAccountByIdRoute = createRoute({
    path: '/crud/accounts/:id',
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Account details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Account not found'),
    },
})

const crudGetAccountByIdHandler: AppRouteHandler<
    typeof crudGetAccountByIdRoute
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

const crudCreateAccountRoute = createRoute({
    path: '/crud/accounts',
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertAccount, 'Account Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAccount, 'Account created successfully'),
    },
})

const crudCreateAccountHandler: AppRouteHandler<
    typeof crudCreateAccountRoute
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

const crudUpdateAccountRoute = createRoute({
    path: '/crud/accounts/:id',
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateAccount, 'Account Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccount, 'Account updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Account not found'),
    },
})

const crudUpdateAccountHandler: AppRouteHandler<
    typeof crudUpdateAccountRoute
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

const crudDeleteAccountRoute = createRoute({
    path: '/crud/accounts/:id',
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Account deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Account not found'),
    },
})

const crudDeleteAccountHandler: AppRouteHandler<
    typeof crudDeleteAccountRoute
> = async (c) => {
    const { id } = c.req.valid('param')
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

    await AccountCrudService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Account deleted successfully',
            success: true,
        },
        OK,
    )
}

const crudDeleteMultipleAccountsRoute = createRoute({
    path: '/crud/accounts',
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Account IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Accounts deleted successfully'),
    },
})

const crudDeleteMultipleAccountsHandler: AppRouteHandler<
    typeof crudDeleteMultipleAccountsRoute
> = async (c) => {
    const { ids } = c.req.valid('json')

    await AccountCrudService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Accounts deleted successfully',
            success: true,
        },
        OK,
    )
}

export const crudAccountRoutes = createRouter()
    .openapi(crudDeleteAccountRoute, crudDeleteAccountHandler)
    .openapi(crudDeleteMultipleAccountsRoute, crudDeleteMultipleAccountsHandler)
    .openapi(crudUpdateAccountRoute, crudUpdateAccountHandler)
    .openapi(crudCreateAccountRoute, crudCreateAccountHandler)
    .openapi(crudGetAccountByIdRoute, crudGetAccountByIdHandler)
    .openapi(crudGetAccountsRoute, crudGetAccountsHandler)
