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
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertTransaction,
    zQueryTransactions,
    zSelectTransaction,
    zUpdateTransaction,
} from '../core/transaction-core.model'
import { TransactionCrudService } from './transaction-crud.service'

const tags = [APP_OPENAPI_TAGS.Transaction]
const path = '/crud/transactions'

const GetTransactionListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryTransactions,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectTransaction), 'Transaction List'),
    },
})

const GetTransactionListCrud: AppRouteHandler<
    typeof GetTransactionListCrudDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await TransactionCrudService.findMany(groupSpecificQuery)
    const count = await TransactionCrudService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Transaction list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetTransactionCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectTransaction, 'Item'),
    },
})

const GetTransactionCrud: AppRouteHandler<
    typeof GetTransactionCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await TransactionCrudService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Transaction fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateTransactionCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertTransaction, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectTransaction, 'Item'),
    },
})

const CreateTransactionCrud: AppRouteHandler<
    typeof CreateTransactionCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')
    const data = await TransactionCrudService.create({ ...input, groupId })

    return c.json(
        {
            data,
            message: 'Transaction created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateTransactionCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateTransaction, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectTransaction, 'Item'),
    },
})

const UpdateTransactionCrud: AppRouteHandler<
    typeof UpdateTransactionCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await TransactionCrudService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }

    const input = c.req.valid('json')
    const data = await TransactionCrudService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Transaction updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteTransactionCrudDef = createRoute({
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

const DeleteTransactionCrud: AppRouteHandler<
    typeof DeleteTransactionCrudDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await TransactionCrudService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }
    await TransactionCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Transaction deleted successfully',
            success: true,
        },
        OK,
    )
}

export const transactionCrudRoutes = createRouter()
    .openapi(GetTransactionListCrudDef, GetTransactionListCrud)
    .openapi(CreateTransactionCrudDef, CreateTransactionCrud)
    .openapi(UpdateTransactionCrudDef, UpdateTransactionCrud)
    .openapi(DeleteTransactionCrudDef, DeleteTransactionCrud)
    .openapi(GetTransactionCrudDef, GetTransactionCrud)
