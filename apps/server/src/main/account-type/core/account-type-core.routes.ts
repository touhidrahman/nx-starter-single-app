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
    zInsertAccountType,
    zQueryAccountTypes,
    zSelectAccountType,
    zUpdateAccountType,
} from './account-type-core.model'
import { AccountTypeCoreService } from './account-type-core.service'

const tags = [APP_OPENAPI_TAGS.AccountType]
const path = '/core/account-types'
const middleware = undefined // [checkToken, isAdmin]

const GetAccountTypeListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryAccountTypes,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccountType), 'AccountType List'),
    },
})

const GetAccountTypeListCore: AppRouteHandler<typeof GetAccountTypeListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await AccountTypeCoreService.findMany(query)
    const count = await AccountTypeCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'AccountType list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetAccountTypeByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAccountType, 'AccountType details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AccountType not found'),
    },
})

const GetAccountTypeByIdCore: AppRouteHandler<typeof GetAccountTypeByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const accountType = await AccountTypeCoreService.findById(id)

    if (!accountType) {
        return c.json(
            {
                data: {},
                message: 'AccountType not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: accountType,
            message: 'AccountType details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateAccountTypeCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertAccountType, 'AccountType Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAccountType, 'AccountType created successfully'),
    },
})

const CreateAccountTypeCore: AppRouteHandler<typeof CreateAccountTypeCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newAccountType = await AccountTypeCoreService.create(body)

    return c.json(
        {
            data: newAccountType,
            message: 'AccountType created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateAccountTypeCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateAccountType, 'AccountType Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAccountType, 'AccountType updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AccountType not found'),
    },
})

const UpdateAccountTypeCore: AppRouteHandler<typeof UpdateAccountTypeCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingAccountType = await AccountTypeCoreService.findById(id)

    if (!existingAccountType) {
        return c.json(
            {
                data: {},
                message: 'AccountType not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedAccountType = await AccountTypeCoreService.update(id, body)

    return c.json(
        {
            data: updatedAccountType,
            message: 'AccountType updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAccountTypeCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'AccountType deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AccountType not found'),
    },
})

const DeleteAccountTypeCore: AppRouteHandler<typeof DeleteAccountTypeCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingAccountType = await AccountTypeCoreService.findById(id)

    if (!existingAccountType) {
        return c.json(
            {
                data: {},
                message: 'AccountType not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await AccountTypeCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'AccountType deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyAccountTypeCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'AccountType IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'AccountTypes deleted successfully'),
    },
})

const DeleteManyAccountTypeCore: AppRouteHandler<typeof DeleteManyAccountTypeCoreDef> = async (
    c,
) => {
    const { ids } = c.req.valid('json')

    await AccountTypeCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'AccountTypes deleted successfully',
            success: true,
        },
        OK,
    )
}

export const accountTypeCoreRoutes = createRouter()
    .openapi(DeleteAccountTypeCoreDef, DeleteAccountTypeCore)
    .openapi(DeleteManyAccountTypeCoreDef, DeleteManyAccountTypeCore)
    .openapi(UpdateAccountTypeCoreDef, UpdateAccountTypeCore)
    .openapi(CreateAccountTypeCoreDef, CreateAccountTypeCore)
    .openapi(GetAccountTypeByIdCoreDef, GetAccountTypeByIdCore)
    .openapi(GetAccountTypeListCoreDef, GetAccountTypeListCore)
