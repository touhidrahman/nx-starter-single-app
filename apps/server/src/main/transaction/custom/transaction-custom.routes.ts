import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zQueryTransactions,
    zSelectTransaction,
} from '../core/transaction-core.model'
import { TransactionCustomService } from './transaction-custom.service'

const tags = [APP_OPENAPI_TAGS.Transaction]
const path = '/custom/transactions'

const GetMyTransactionListDef = createRoute({
    path: `${path}/my`,
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
    typeof GetMyTransactionListDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await TransactionCustomService.findMany(
        groupAndUserSpecificQuery,
    )
    const count = await TransactionCustomService.count(
        groupAndUserSpecificQuery,
    )

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

export const transactionCustomRoutes = createRouter().openapi(
    GetMyTransactionListDef,
    GetTransactionListCrud,
)
