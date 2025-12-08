import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { zQueryPlans, zSelectPlan } from '../core/plan-core.model'
import { PlanCustomService } from './plan-custom.service'

const tags = ['Plans']
const path = '/custom/plans'

const GetActivePlanListDef = createRoute({
    path: `${path}/active`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryPlans,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectPlan), 'Active Plan List'),
    },
})

const GetActivePlanList: AppRouteHandler<typeof GetActivePlanListDef> = async (c) => {
    const query = c.req.valid('query')

    const activeQuery = { ...query, isActive: true }
    const data = await PlanCustomService.findMany(activeQuery)
    const count = await PlanCustomService.count(activeQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Active plan list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const planCustomRoutes = createRouter().openapi(GetActivePlanListDef, GetActivePlanList)
