import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertCurrency,
    zQueryCurrencies,
    zSelectCurrency,
    zUpdateCurrency,
} from '../core/currency-core.model'
import { CurrencyCrudService } from './currency-crud.service'

const tags = [APP_OPENAPI_TAGS.Currency]
const path = '/crud/currencys'

const GetCurrencyListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryCurrencies,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectCurrency), 'Currency List'),
    },
})

const GetCurrencyListCrud: AppRouteHandler<typeof GetCurrencyListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await CurrencyCrudService.findMany(groupSpecificQuery)
    const count = await CurrencyCrudService.count(groupSpecificQuery)

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

const GetCurrencyCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectCurrency, 'Item'),
    },
})

const GetCurrencyCrud: AppRouteHandler<typeof GetCurrencyCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Currency not found' })
    }

    const existing = await CurrencyCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Currency not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Currency fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateCurrencyCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertCurrency, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCurrency, 'Item'),
    },
})

const CreateCurrencyCrud: AppRouteHandler<typeof CreateCurrencyCrudDef> = async (c) => {
    const { groupId, sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Currency could not be created',
        })
    }

    const data = await CurrencyCrudService.create({
        ...input,
        groupId,
        creatorId,
    })

    return c.json(
        {
            data,
            message: 'Currency created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateCurrencyCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateCurrency, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectCurrency, 'Item'),
    },
})

const UpdateCurrencyCrud: AppRouteHandler<typeof UpdateCurrencyCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Currency cannot be updated',
        })
    }

    const existing = await CurrencyCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Currency not found' })
    }

    const input = c.req.valid('json')
    const data = await CurrencyCrudService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Currency updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteCurrencyCrudDef = createRoute({
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

const DeleteCurrencyCrud: AppRouteHandler<typeof DeleteCurrencyCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Currency cannot be deleted',
        })
    }

    const existing = await CurrencyCrudService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Currency not found' })
    }
    await CurrencyCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Currency deleted successfully',
            success: true,
        },
        OK,
    )
}

export const currencyCrudRoutes = createRouter()
    .openapi(GetCurrencyListCrudDef, GetCurrencyListCrud)
    .openapi(CreateCurrencyCrudDef, CreateCurrencyCrud)
    .openapi(UpdateCurrencyCrudDef, UpdateCurrencyCrud)
    .openapi(DeleteCurrencyCrudDef, DeleteCurrencyCrud)
    .openapi(GetCurrencyCrudDef, GetCurrencyCrud)
