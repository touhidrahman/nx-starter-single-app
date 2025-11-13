import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectPlan, zUpdatePlan } from '../plan.schema'
import { findPlanById, updatePlan } from '../plan.service'

export const updatePlanRoute = createRoute({
    path: '/v1/plans/:id',
    method: 'patch',
    tags: ['Plan'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zUpdatePlan, 'plan update details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectPlan, 'plan updated successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid plan data'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'plan not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const updatePlanHandler: AppRouteHandler<
    typeof updatePlanRoute
> = async (c) => {
    const planId = c.req.param('id')
    const { sub } = c.get('jwtPayload')
    const body = c.req.valid('json')

    try {
        const existingPlan = await findPlanById(planId)
        if (!existingPlan) {
            return c.json(
                { data: {}, message: 'Item not found', success: false },
                NOT_FOUND,
            )
        }

        const [updatedPlan] = await updatePlan(planId, body)

        await saveLog(
            'plans',
            planId,
            sub,
            'update',
            toJsonSafe(existingPlan),
            toJsonSafe(updatedPlan),
        )

        return c.json(
            {
                data: updatedPlan,
                message: 'plan updated successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
