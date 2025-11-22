import { createRoute, z } from '@hono/zod-openapi'
import { addDays } from 'date-fns'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { PlanCustomService } from '../../plan/custom/plan-custom.service'
import { findGroupById } from '../group.service'

export const addSubscriptionToGroupRoute = createRoute({
    path: '/groups/:id/add-subscription',
    method: 'put',
    tags: ['Group'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: zId,
        body: jsonContent(
            z.object({
                pricingPlanId: z.string(),
            }),
            'Subscription Plan',
        ),
    },
    responses: {
        [CREATED]: ApiResponse(
            zEmpty,
            'Subscription added to group successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group or pricing plan not found'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const addSubscriptionToGroupHandler: AppRouteHandler<
    typeof addSubscriptionToGroupRoute
> = async (c) => {
    const groupId = c.req.param('id')
    const { pricingPlanId } = c.req.valid('json')

    try {
        const group = await findGroupById(groupId)
        if (!group) {
            return c.json(
                { data: {}, success: false, message: 'Group not found' },
                NOT_FOUND,
            )
        }

        // Find the pricing plan
        const pricingPlan = await PlanCustomService.findById(pricingPlanId)
        if (!pricingPlan) {
            return c.json(
                { data: {}, success: false, message: 'Pricing plan not found' },
                NOT_FOUND,
            )
        }

        // Calculate expiration date
        const expirationDate = addDays(
            new Date(),
            pricingPlan.trialPeriodDays || 30,
        )

        // Add subscription to the group
        // await db
        //     .update(groupsTable)
        //     .set({
        //         pricingPlanId: pricingPlan.id,
        //         subscriptionExpiresAt: expirationDate,
        //     })
        //     .where(eq(groupsTable.id, groupId))

        return c.json(
            { data: {}, success: true, message: 'Subscription added to group' },
            CREATED,
        )
    } catch (error) {
        c.var.logger.error(error, 'Error adding subscription to group')
        return c.json(
            {
                message: 'Error adding subscription to group',
                data: {},
                success: false,
                error: error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
