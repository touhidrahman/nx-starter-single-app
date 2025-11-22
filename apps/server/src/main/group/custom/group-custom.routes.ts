import { createRoute, z } from '@hono/zod-openapi'
import { addDays } from 'date-fns'
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { PlanCustomService } from '../../plan/custom/plan-custom.service'
import { zQueryGroups, zSelectGroup } from '../core/group-core.model'
import { GroupCustomService } from './group-custom.service'

const tags = [APP_OPENAPI_TAGS.Group]
const path = '/custom/groups'

const GetMyGroupListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryGroups,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectGroup), 'Group List'),
    },
})

const GetGroupListCrud: AppRouteHandler<typeof GetMyGroupListDef> = async (
    c,
) => {
    const query = c.req.valid('query')
    const { sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const data = await GroupCustomService.findMany({ ...query, creatorId })
    const count = await GroupCustomService.count({ ...query, creatorId })

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Group list fetched successfully',
            success: true,
        },
        OK,
    )
}

const SubscribePlanDef = createRoute({
    path: `${path}/:id/plan/:planId/subscribe`,
    method: 'put',
    tags: ['Group'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({
            id: z.string(),
            planId: z.string(),
        }),
        body: jsonContent(zInsertSubscription, 'Input'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zEmpty,
            'Subscription added to group successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group or pricing plan not found'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid data'),
    },
})

export const SubscribePlan: AppRouteHandler<typeof SubscribePlanDef> = async (
    c,
) => {
    const groupId = c.req.param('id')
    const planId = c.req.param('planId')

    try {
        const group = await GroupCustomService.findById(groupId)
        if (!group) {
            return c.json(
                { data: {}, success: false, message: 'Group not found' },
                NOT_FOUND,
            )
        }

        const pricingPlan = await PlanCustomService.findById(planId)
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

// const GetGroupMembersDef = createRoute({
//     path: `${path}/:id/members`,
//     tags,
//     method: REQ_METHOD.GET,
//     middleware: [checkToken] as const,
//     request: {
//         params: zId,
//     },
//     responses: {
//         [OK]: ApiListResponse(z.array(zSelectGroup), 'Group List'),
//     },
// })

// const GetGroupMembers: AppRouteHandler<typeof GetGroupMembersDef> = async (
//     c,
// ) => {
//     const params = c.req.valid('param')
//     const { groupId, sub: creatorId } = c.get(
//         'jwtPayload',
//     ) as AccessTokenPayload

//     if (params.id !== groupId) {
//         throw new HTTPException(FORBIDDEN, {
//             message: 'Group members cannot be accessed',
//         })
//     }

//     return c.json(
//         {
//             data,
//             pagination: buildPaginationResponse(
//                 params.page,
//                 params.size,
//                 count,
//             ),
//             message: 'Group members fetched successfully',
//             success: true,
//         },
//         OK,
//     )
// }

export const groupCustomRoutes = createRouter().openapi(
    GetMyGroupListDef,
    GetGroupListCrud,
)
