import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import {
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkPermission } from '../../middlewares/check-permission.middleware'
import { checkToken } from '../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../models/common.schema'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import {
    zInsertTransaction,
    zQueryTransactions,
    zSelectTransaction,
    zUpdateTransaction,
} from './transaction.model'
import { TransactionService } from './transaction.service'

const tags = ['Transaction']
const path = '/transactions'

const GetTransactionListDef = createRoute({
    path: path,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Transaction:Read'])] as const,
    request: {
        query: zQueryTransactions,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectTransaction), 'Transaction List'),
    },
})

const GetTransactionList: AppRouteHandler<
    typeof GetTransactionListDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await TransactionService.findMany(groupSpecificQuery)
    const count = await TransactionService.count(groupSpecificQuery)

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

const GetTransactionDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Transaction:Read'])] as const,
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

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }

    const existing = await TransactionService.findByIdAndGroupId(id, groupId)
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
    method: 'post',
    middleware: [checkToken, checkPermission(['Transaction:Write'])] as const,
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
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Transaction could not be created',
        })
    }

    try {
        const data =
            await TransactionService.createTransactionAndUpdateAccountBalance({
                ...input,
                groupId,
                creatorId,
            })

        return c.json(
            {
                data,
                message: 'Transaction created successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(
            error instanceof Error
                ? (error.cause as ContentfulStatusCode)
                : INTERNAL_SERVER_ERROR,
            {
                message:
                    (error as Error).message ?? 'Failed to create transaction',
            },
        )
    }
}

const UpdateTransactionDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware: [checkToken, checkPermission(['Transaction:Write'])] as const,
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

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Transaction cannot be updated',
        })
    }

    const existing = await TransactionService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }

    const input = c.req.valid('json')
    const data = await TransactionService.updateTransactionAndAccountBalance(
        existing.id,
        {
            ...input,
            groupId,
        },
    )

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
    method: 'delete',
    middleware: [checkToken, checkPermission(['Transaction:Delete'])] as const,
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

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Transaction cannot be deleted',
        })
    }

    const existing = await TransactionService.findByIdAndGroupId(id, groupId)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Transaction not found' })
    }

    await TransactionService.deleteTransactionAndUpdateAccountBalance(
        existing.id,
    )

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
    .openapi(GetTransactionListDef, GetTransactionList)
    .openapi(CreateTransactionDef, CreateTransaction)
    .openapi(UpdateTransactionDef, UpdateTransaction)
    .openapi(DeleteTransactionDef, DeleteTransaction)
    .openapi(GetTransactionDef, GetTransaction)
