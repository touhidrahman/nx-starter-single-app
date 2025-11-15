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
} from './transaction-basic.model'
import { TransactionBasicService } from './transaction-basic.service'

const tags = [APP_OPENAPI_TAGS.Transaction]
const path = '/basic/transactions'
const middleware = undefined // [checkToken, isAdmin]

const GetTransactionListBasicDef = createRoute({
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

const GetTransactionListBasic: AppRouteHandler<
    typeof GetTransactionListBasicDef
> = async (c) => {
    const { page, size, ...query } = c.req.valid('query')
    const data = await TransactionBasicService.findMany(query)
    const count = await TransactionBasicService.count(query)

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

const GetTransactionByIdBasicDef = createRoute({
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

const GetTransactionByIdBasic: AppRouteHandler<
    typeof GetTransactionByIdBasicDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const transaction = await TransactionBasicService.findById(id)

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

const CreateTransactionBasicDef = createRoute({
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

const CreateTransactionBasic: AppRouteHandler<
    typeof CreateTransactionBasicDef
> = async (c) => {
    const body = c.req.valid('json')
    const newTransaction = await TransactionBasicService.create(body)

    return c.json(
        {
            data: newTransaction,
            message: 'Transaction created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateTransactionBasicDef = createRoute({
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

const UpdateTransactionBasic: AppRouteHandler<
    typeof UpdateTransactionBasicDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingTransaction = await TransactionBasicService.findById(id)

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

    const updatedTransaction = await TransactionBasicService.update(id, body)

    return c.json(
        {
            data: updatedTransaction,
            message: 'Transaction updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteTransactionBasicDef = createRoute({
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

const DeleteTransactionBasic: AppRouteHandler<
    typeof DeleteTransactionBasicDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const existingTransaction = await TransactionBasicService.findById(id)

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

    await TransactionBasicService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Transaction deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyTransactionBasicDef = createRoute({
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

const DeleteManyTransactionBasic: AppRouteHandler<
    typeof DeleteManyTransactionBasicDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await TransactionBasicService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Transactions deleted successfully',
            success: true,
        },
        OK,
    )
}

export const transactionBasicRoutes = createRouter()
    .openapi(DeleteTransactionBasicDef, DeleteTransactionBasic)
    .openapi(DeleteManyTransactionBasicDef, DeleteManyTransactionBasic)
    .openapi(UpdateTransactionBasicDef, UpdateTransactionBasic)
    .openapi(CreateTransactionBasicDef, CreateTransactionBasic)
    .openapi(GetTransactionByIdBasicDef, GetTransactionByIdBasic)
    .openapi(GetTransactionListBasicDef, GetTransactionListBasic)
