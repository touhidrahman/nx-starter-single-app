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
import { AccessTokenPayload } from '../../auth/token.util'
import {
    zInsertTransaction,
    zQueryTransactions,
    zSelectTransaction,
    zUpdateTransaction,
} from '../basic/transaction-basic.model'
import { TransactionCommonService } from './transaction-common.service'

const tags = [APP_OPENAPI_TAGS.Transaction]
const path = '/common/transactions'

const GetTransactionListDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryTransactions,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectTransaction), 'List of Items'),
    },
})

const GetTransactionList: AppRouteHandler<
    typeof GetTransactionListDef
> = async (c) => {
    const { page, size, ...query } = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await TransactionCommonService.findMany(groupSpecificQuery)
    const count = await TransactionCommonService.count(groupSpecificQuery)

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

const GetTransactionDef = createRoute({
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

const GetTransaction: AppRouteHandler<typeof GetTransactionDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await TransactionCommonService.findByIdAndGroupId(
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

const CreateTransactionDef = createRoute({
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

const CreateTransaction: AppRouteHandler<typeof CreateTransactionDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')
    const data = await TransactionCommonService.create({ ...input, groupId })

    return c.json(
        {
            data,
            message: 'Transaction created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateTransactionDef = createRoute({
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

const UpdateTransaction: AppRouteHandler<typeof UpdateTransactionDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await TransactionCommonService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }

    const input = c.req.valid('json')
    const data = await TransactionCommonService.update(existing.id, {
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

const DeleteTransactionDef = createRoute({
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

const DeleteTransaction: AppRouteHandler<typeof DeleteTransactionDef> = async (
    c,
) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id
    const existing = await TransactionCommonService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }
    await TransactionCommonService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Transaction deleted successfully',
            success: true,
        },
        OK,
    )
}

export const transactionCommonRoutes = createRouter()
    .openapi(GetTransactionListDef, GetTransactionList)
    .openapi(CreateTransactionDef, CreateTransaction)
    .openapi(UpdateTransactionDef, UpdateTransaction)
    .openapi(DeleteTransactionDef, DeleteTransaction)
    .openapi(GetTransactionDef, GetTransaction)
