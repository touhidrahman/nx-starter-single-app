import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkToken } from '../../middlewares/check-token.middleware'
import { ApiListResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import {
    zQueryTransactionSchedules,
    zSelectTransactionSchedule,
} from './transaction-schedule.model'
import { TransactionScheduleService } from './transaction-schedule.service'

const tags = ['TransactionSchedule']
const path = '/transaction-schedules/custom'

const GetMyTransactionScheduleListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: zQueryTransactionSchedules,
    },
    responses: {
        [OK]: ApiListResponse(
            z.array(zSelectTransactionSchedule),
            'TransactionSchedule List',
        ),
    },
})

const GetTransactionScheduleListCrud: AppRouteHandler<
    typeof GetMyTransactionScheduleListDef
> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, creatorId }
    const data = await TransactionScheduleService.findMany(
        groupAndUserSpecificQuery,
    )
    const count = await TransactionScheduleService.count(
        groupAndUserSpecificQuery,
    )

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'TransactionSchedule list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const transactionScheduleRoutes = createRouter().openapi(
    GetMyTransactionScheduleListDef,
    GetTransactionScheduleListCrud,
)
