import { createRoute } from '@hono/zod-openapi'
import { CREATED, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../core/core.type'
import { findPlanByName } from '../main/plan/plan.service'
import { zEmpty } from '../models/common.schema'
import { ApiResponse } from '../utils/api-response.util'
import { insertPlan } from '../utils/seed.service'
import { SEED_DATA_PLANS } from './seed-data'

export const postSeedRoute = createRoute({
    path: '/v1/seed',
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
            const existingPlan = await findPlanByName(plan.name)
            if (!existingPlan) {
                await insertPlan(plan)
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
