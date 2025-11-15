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
    zInsertTransaction,
    zQueryTransactions,
    zSelectTransaction,
    zUpdateTransaction,
} from './transaction-core.model'
import { TransactionCoreService } from './transaction-core.service'

const tags = [APP_OPENAPI_TAGS.Transaction]
const path = '/core/transactions'
const middleware = undefined // [checkToken, isAdmin]

const GetTransactionListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryTransactions,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectTransaction), 'Transaction List'),
    },
})

const GetTransactionListCore: AppRouteHandler<
    typeof GetTransactionListCoreDef
> = async (c) => {
    const { page, size, ...query } = c.req.valid('query')
    const data = await TransactionCoreService.findMany(query)
    const count = await TransactionCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(page, size, count),
            message: 'Transaction list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetTransactionByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectTransaction, 'Transaction details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Transaction not found'),
    },
})

const GetTransactionByIdCore: AppRouteHandler<
    typeof GetTransactionByIdCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const transaction = await TransactionCoreService.findById(id)

    if (!transaction) {
        return c.json(
            {
                data: {},
                message: 'Transaction not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: transaction,
            message: 'Transaction details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateTransactionCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertTransaction, 'Transaction Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectTransaction,
            'Transaction created successfully',
        ),
    },
})

const CreateTransactionCore: AppRouteHandler<
    typeof CreateTransactionCoreDef
> = async (c) => {
    const body = c.req.valid('json')
    const newTransaction = await TransactionCoreService.create(body)

    return c.json(
        {
            data: newTransaction,
            message: 'Transaction created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateTransactionCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateTransaction, 'Transaction Update Data'),
    },
    responses: {
        [OK]: ApiResponse(
            zSelectTransaction,
            'Transaction updated successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Transaction not found'),
    },
})

const UpdateTransactionCore: AppRouteHandler<
    typeof UpdateTransactionCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingTransaction = await TransactionCoreService.findById(id)

    if (!existingTransaction) {
        return c.json(
            {
                data: {},
                message: 'Transaction not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedTransaction = await TransactionCoreService.update(id, body)

    return c.json(
        {
            data: updatedTransaction,
            message: 'Transaction updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteTransactionCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Transaction deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Transaction not found'),
    },
})

const DeleteTransactionCore: AppRouteHandler<
    typeof DeleteTransactionCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const existingTransaction = await TransactionCoreService.findById(id)

    if (!existingTransaction) {
        return c.json(
            {
                data: {},
                message: 'Transaction not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await TransactionCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Transaction deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyTransactionCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Transaction IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Transactions deleted successfully'),
    },
})

const DeleteManyTransactionCore: AppRouteHandler<
    typeof DeleteManyTransactionCoreDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await TransactionCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Transactions deleted successfully',
            success: true,
        },
        OK,
    )
}

export const transactionCoreRoutes = createRouter()
    .openapi(DeleteTransactionCoreDef, DeleteTransactionCore)
    .openapi(DeleteManyTransactionCoreDef, DeleteManyTransactionCore)
    .openapi(UpdateTransactionCoreDef, UpdateTransactionCore)
    .openapi(CreateTransactionCoreDef, CreateTransactionCore)
    .openapi(GetTransactionByIdCoreDef, GetTransactionByIdCore)
    .openapi(GetTransactionListCoreDef, GetTransactionListCore)
