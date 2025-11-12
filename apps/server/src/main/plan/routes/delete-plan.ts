import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { deletePlan, findPlanById } from '../plan.service'

export const deletePlanRoute = createRoute({
    path: '/v1/plans/:id',
    method: 'delete',
    tags: ['Plan'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Plan deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Plan not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deletePlanHandler: AppRouteHandler<
    typeof deletePlanRoute
> = async (c) => {
    const planId = c.req.param('id')
    const { sub } = c.get('jwtPayload')

    try {
        const plan = await findPlanById(planId)
        if (!plan) {
            return c.json(
                { data: {}, message: 'plan not found', success: false },
                NOT_FOUND,
            )
        }

        await deletePlan(planId)

        await saveLog('plans', planId, sub, 'delete', toJsonSafe(plan), {})

        return c.json(
            {
                data: { planId },
                message: 'Plan deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        console.error(
            'Error deleting plan:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        c.var.logger.error(error?.stack ?? error)
        return c.json(
            {
                data: {},
                message: 'Failed to delete plan',
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
