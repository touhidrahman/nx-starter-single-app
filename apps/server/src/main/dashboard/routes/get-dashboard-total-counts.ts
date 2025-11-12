import { createRoute } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { dashboardDataSchema } from '../dashboard.schema'
import { getDashboardData } from '../dashboard.service'

export const getDashboardTotalCountsRoute = createRoute({
    path: '/v1/dashboards/total-counts',
    method: 'get',
    tags: ['Dashboard'],
    middleware: [checkToken] as const,

    responses: {
        [OK]: ApiResponse(dashboardDataSchema, 'Total Counts'),
    },
})

export const getDashboardTotalCountsHandler: AppRouteHandler<
    typeof getDashboardTotalCountsRoute
> = async (c) => {
    const payload = await c.get('jwtPayload')
    const groupId = payload.groupId

    const data = await getDashboardData(groupId)

    return c.json(
        {
            data: data,
            message: 'Total Counts',
            success: true,
        },
        OK,
    )
}
