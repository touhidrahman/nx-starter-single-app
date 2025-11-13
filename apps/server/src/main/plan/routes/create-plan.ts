import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { InsertPlan, zInsertPlan, zSelectPlan } from '../plan.schema'
import { createPlan, findPlanById } from '../plan.service'

export const createPlanRoute = createRoute({
    path: '/v1/plans',
    method: 'post',
    tags: ['Plan'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(zInsertPlan, 'Plan details'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectPlan, 'Plan created successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid plan data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})

export const createPlanHandler: AppRouteHandler<
    typeof createPlanRoute
> = async (c) => {
    const body = c.req.valid('json') as InsertPlan
    const { sub } = c.get('jwtPayload')
    try {
        const existingPlan = await findPlanById(body?.name ?? '')

        if (existingPlan) {
            return c.json(
                {
                    data: {},
                    message: `Plan already exists with plan : ${body.name}`,
                    success: false,
                },
                BAD_REQUEST,
            )
        }
        const plan: InsertPlan = {
            ...body,
            storageLimit: body.storageLimit
                ? body.storageLimit * 1024 * 1024
                : 0,
            monthlyPrice: Number.parseFloat(body.monthlyPrice.toString()),
            yearlyPrice: Number.parseFloat(body.yearlyPrice?.toString() ?? '0'),
            discountPrice: Number.parseFloat(
                body.discountPrice?.toString() ?? '0',
            ),
        }

        const [newPlan] = await createPlan(plan)

        await saveLog(
            'plans',
            plan?.id ?? '',
            sub,
            'create',
            {},
            toJsonSafe(newPlan),
        )

        return c.json(
            {
                data: newPlan,
                message: 'Plan created successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    error: error,
                    message: 'Invalid plan data',
                    success: false,
                },
                BAD_REQUEST,
            )
        }
        console.error(
            'Error creating plan:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            {
                data: {},
                message: 'Failed to create plan',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
