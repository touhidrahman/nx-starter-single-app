import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertAccount,
    zQueryAccounts,
    zSelectAccount,
    zUpdateAccount,
} from './account-core.model'
import { AccountCoreService } from './account-core.service'

const tags = [APP_OPENAPI_TAGS.Account]
const path = '/core/accounts'
const middleware = undefined // [checkToken, isAdmin]

const GetAccountListCoreDef = createRoute({
    path,
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

const GetAccountListCore: AppRouteHandler<typeof GetAccountListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await AccountCoreService.findMany(query)
    const count = await AccountCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Account list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetAccountByIdCoreDef = createRoute({
    path: `${path}/:id`,
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

const GetAccountByIdCore: AppRouteHandler<typeof GetAccountByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const account = await AccountCoreService.findById(id)

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

const CreateAccountCoreDef = createRoute({
    path,
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

const CreateAccountCore: AppRouteHandler<typeof CreateAccountCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newAccount = await AccountCoreService.create(body)

    return c.json(
        {
            data: newAccount,
            message: 'Account created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateAccountCoreDef = createRoute({
    path: `${path}/:id`,
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

const UpdateAccountCore: AppRouteHandler<typeof UpdateAccountCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingAccount = await AccountCoreService.findById(id)

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

    const updatedAccount = await AccountCoreService.update(id, body)

    return c.json(
        {
            data: updatedAccount,
            message: 'Account updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAccountCoreDef = createRoute({
    path: `${path}/:id`,
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

const DeleteAccountCore: AppRouteHandler<typeof DeleteAccountCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingAccount = await AccountCoreService.findById(id)

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

    await AccountCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Account deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyAccountsCoreDef = createRoute({
    path,
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

const DeleteManyAccountsCore: AppRouteHandler<typeof DeleteManyAccountsCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await AccountCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Accounts deleted successfully',
            success: true,
        },
        OK,
    )
}

export const accountCoreRoutes = createRouter()
    .openapi(DeleteAccountCoreDef, DeleteAccountCore)
    .openapi(DeleteManyAccountsCoreDef, DeleteManyAccountsCore)
    .openapi(UpdateAccountCoreDef, UpdateAccountCore)
    .openapi(CreateAccountCoreDef, CreateAccountCore)
    .openapi(GetAccountByIdCoreDef, GetAccountByIdCore)
    .openapi(GetAccountListCoreDef, GetAccountListCore)
