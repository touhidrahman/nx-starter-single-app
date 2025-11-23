import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../middlewares/check-token.middleware'
import { ApiListResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import { zQueryTransactions, zSelectTransaction } from './transaction.model'
import { TransactionService } from './transaction.service'

const tags = ['Transaction']
const path = '/transactions/custom'

const GetMyTransactionListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: zQueryTransactions,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectTransaction), 'Transaction List'),
    },
})

const GetTransactionListCrud: AppRouteHandler<
    typeof GetMyTransactionListDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await TransactionService.findMany(groupAndUserSpecificQuery)
    const count = await TransactionService.count(groupAndUserSpecificQuery)

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

export const transactionRoutes = createRouter().openapi(
    GetMyTransactionListDef,
    GetTransactionListCrud,
)
