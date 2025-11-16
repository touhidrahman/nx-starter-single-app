import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { zEmpty, zId, zIds } from '../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccountTypeService } from './account-type.service'
import {
    zInsertAccountType,
    zQueryAccountTypes,
    zSelectAccountType,
    zUpdateAccountType,
} from './core/account-type-core.model'

const tags = [APP_OPENAPI_TAGS.AccountType]
const path = '/account-types'

const GetAccountTypeListDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [] as const,
    request: {
        query: zQueryAccountTypes,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAccountType), 'AccountType List'),
    },
})

const GetAccountTypeList: AppRouteHandler<
    typeof GetAccountTypeListDef
> = async (c) => {
    const query = c.req.valid('query')
    const data = await AccountTypeService.findMany(query)
    const count = await AccountTypeService.count(query)

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

const GetAccountTypeByIdDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAccountType, 'AccountType details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AccountType not found'),
    },
})

const GetAccountTypeById: AppRouteHandler<
    typeof GetAccountTypeByIdDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const accountType = await AccountTypeService.findById(id)

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

const CreateAccountTypeDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [] as const,
    request: {
        body: jsonContent(zInsertAccountType, 'AccountType Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectAccountType,
            'AccountType created successfully',
        ),
    },
})

const CreateAccountType: AppRouteHandler<typeof CreateAccountTypeDef> = async (
    c,
) => {
    const body = c.req.valid('json')
    const newAccountType = await AccountTypeService.create(body)

    return c.json(
        {
            data: newAccountType,
            message: 'AccountType created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateAccountTypeDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAccountType, 'AccountType Update Data'),
    },
    responses: {
        [OK]: ApiResponse(
            zSelectAccountType,
            'AccountType updated successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AccountType not found'),
    },
})

const UpdateAccountType: AppRouteHandler<typeof UpdateAccountTypeDef> = async (
    c,
) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingAccountType = await AccountTypeService.findById(id)

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

    const updatedAccountType = await AccountTypeService.update(id, body)

    return c.json(
        {
            data: updatedAccountType,
            message: 'AccountType updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAccountTypeDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'AccountType deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AccountType not found'),
    },
})

const DeleteAccountType: AppRouteHandler<typeof DeleteAccountTypeDef> = async (
    c,
) => {
    const { id } = c.req.valid('param')
    const existingAccountType = await AccountTypeService.findById(id)

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

    await AccountTypeService.delete(id)

    return c.json(
        {
            data: {},
            message: 'AccountType deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyAccountTypeDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [] as const,
    request: {
        body: jsonContent(zIds, 'AccountType IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'AccountTypes deleted successfully'),
    },
})

const DeleteManyAccountType: AppRouteHandler<
    typeof DeleteManyAccountTypeDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await AccountTypeService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'AccountTypes deleted successfully',
            success: true,
        },
        OK,
    )
}

export const accountTypeRoutes = createRouter()
    .openapi(DeleteAccountTypeDef, DeleteAccountType)
    .openapi(DeleteManyAccountTypeDef, DeleteManyAccountType)
    .openapi(UpdateAccountTypeDef, UpdateAccountType)
    .openapi(CreateAccountTypeDef, CreateAccountType)
    .openapi(GetAccountTypeByIdDef, GetAccountTypeById)
    .openapi(GetAccountTypeListDef, GetAccountTypeList)
