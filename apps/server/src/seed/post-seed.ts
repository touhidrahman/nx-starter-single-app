import { createRoute } from '@hono/zod-openapi'
import { CREATED, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../core/core.type'
import { PlanCustomService } from '../main/plan/custom/plan-custom.service'
import { zEmpty } from '../models/common.schema'
import { ApiResponse } from '../utils/api-response.util'
import { SEED_DATA_PLANS } from './seed-data'
export const postSeedRoute = createRoute({
    path: '/seed',
    method: 'post',
    tags: ['Core'],
    request: {},
    responses: {
        [CREATED]: ApiResponse(zEmpty, 'Seed successfull'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const postSeedHandler: AppRouteHandler<typeof postSeedRoute> = async (
    c,
) => {
    try {
        for (const plan of SEED_DATA_PLANS) {
            const existingPlan = await PlanCustomService.findOne({
                name: plan.name,
            })
            if (!existingPlan) {
                await PlanCustomService.create(plan)
            }
        }

        return c.json(
            {
                data: {},
                message: 'Database seeded successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        return c.json(
            { data: {}, message: 'Failed to seed data', error, success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
