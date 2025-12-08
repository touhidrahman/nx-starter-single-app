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
    zInsertCurrency,
    zQueryCurrencies,
    zSelectCurrency,
    zUpdateCurrency,
} from './currency-core.model'
import { CurrencyCoreService } from './currency-core.service'

const tags = [APP_OPENAPI_TAGS.Currency]
const path = '/core/currencies'
const middleware = undefined // [checkToken, isAdmin]

const GetCurrencyListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryCurrencies,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectCurrency), 'Currency List'),
    },
})

const GetCurrencyListCore: AppRouteHandler<typeof GetCurrencyListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await CurrencyCoreService.findMany(query)
    const count = await CurrencyCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Currency list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetCurrencyByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCurrency, 'Currency details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Currency not found'),
    },
})

const GetCurrencyByIdCore: AppRouteHandler<typeof GetCurrencyByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const currency = await CurrencyCoreService.findById(id)

    if (!currency) {
        return c.json(
            {
                data: {},
                message: 'Currency not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: currency,
            message: 'Currency details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateCurrencyCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertCurrency, 'Currency Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectCurrency, 'Currency created successfully'),
    },
})

const CreateCurrencyCore: AppRouteHandler<typeof CreateCurrencyCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newCurrency = await CurrencyCoreService.create(body)

    return c.json(
        {
            data: newCurrency,
            message: 'Currency created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateCurrencyCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateCurrency, 'Currency Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCurrency, 'Currency updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Currency not found'),
    },
})

const UpdateCurrencyCore: AppRouteHandler<typeof UpdateCurrencyCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingCurrency = await CurrencyCoreService.findById(id)

    if (!existingCurrency) {
        return c.json(
            {
                data: {},
                message: 'Currency not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedCurrency = await CurrencyCoreService.update(id, body)

    return c.json(
        {
            data: updatedCurrency,
            message: 'Currency updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteCurrencyCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Currency deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Currency not found'),
    },
})

const DeleteCurrencyCore: AppRouteHandler<typeof DeleteCurrencyCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingCurrency = await CurrencyCoreService.findById(id)

    if (!existingCurrency) {
        return c.json(
            {
                data: {},
                message: 'Currency not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await CurrencyCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Currency deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyCurrencyCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Currency IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Currencies deleted successfully'),
    },
})

const DeleteManyCurrencyCore: AppRouteHandler<typeof DeleteManyCurrencyCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await CurrencyCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Currencies deleted successfully',
            success: true,
        },
        OK,
    )
}

export const currencyCoreRoutes = createRouter()
    .openapi(DeleteCurrencyCoreDef, DeleteCurrencyCore)
    .openapi(DeleteManyCurrencyCoreDef, DeleteManyCurrencyCore)
    .openapi(UpdateCurrencyCoreDef, UpdateCurrencyCore)
    .openapi(CreateCurrencyCoreDef, CreateCurrencyCore)
    .openapi(GetCurrencyByIdCoreDef, GetCurrencyByIdCore)
    .openapi(GetCurrencyListCoreDef, GetCurrencyListCore)
