import { createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import {
    BAD_REQUEST,
    CREATED,
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import z from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiResponse } from '../../../utils/api-response.util'
import { DateUtil } from '../../../utils/date.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { PlanCustomService } from '../../plan/custom/plan-custom.service'
import { zInsertSubscription } from '../../subscription/core/subscription-core.model'
import { zSubscriptionWithPlan } from '../../subscription/crud/subscription-crud.model'
import { SubscriptionCustomService } from '../../subscription/custom/subscription-custom.service'
import { zSelectGroup } from '../core/group-core.model'
import { zGroupMember } from './group-custom.model'
import { GroupCustomService } from './group-custom.service'

const tags = [APP_OPENAPI_TAGS.Group]
const path = '/groups/custom'

const GetMyGroupListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken] as const,
    responses: {
        [OK]: ApiResponse(
            z.array(
                zSelectGroup.extend({
                    membership: z.enum(['Owner', 'Member']),
                }),
            ),
            'Group List',
        ),
    },
})

const GetGroupListCrud: AppRouteHandler<typeof GetMyGroupListDef> = async (c) => {
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload

    const data = await GroupCustomService.findInvolvedGroups(userId)

    return c.json(
        {
            data,
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
        query: z.object({ yearly: z.coerce.boolean().optional() }),
        body: jsonContent(zInsertSubscription, 'Input'),
    },
    responses: {
        [CREATED]: ApiResponse(zSubscriptionWithPlan, 'Subscription successfull'),
    },
})

export const SubscribePlan: AppRouteHandler<typeof SubscribePlanDef> = async (c) => {
    const groupId = c.req.param('id')
    const planId = c.req.param('planId')
    const body = c.req.valid('json')
    const { yearly } = c.req.valid('query')
    const { sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    try {
        const group = await GroupCustomService.findById(groupId)
        if (!group) {
            throw new HTTPException(NOT_FOUND, { message: 'Group not found' })
        }

        const pricingPlan = await PlanCustomService.findById(planId)
        if (!pricingPlan) {
            throw new HTTPException(NOT_FOUND, {
                message: 'Pricing plan not found',
            })
        }

        const expirationDate = yearly
            ? DateUtil.addYears(new Date(), 1)
            : DateUtil.addDays(new Date(), 30)

        const subscription = await SubscriptionCustomService.create({
            ...body,
            groupId: group.id,
            creatorId,
            endDate: expirationDate,
        })

        const data = await SubscriptionCustomService.findById(subscription.id)
        if (!data) {
            throw new HTTPException(INTERNAL_SERVER_ERROR, {
                message: 'Subscription not found',
            })
        }

        return c.json(
            {
                data: data,
                success: true,
                message: 'Subscription was successful',
            },
            CREATED,
        )
    } catch (error) {
        throw new HTTPException(INTERNAL_SERVER_ERROR, {
            message: 'Error adding subscription',
        })
    }
}

const GetGroupMembersDef = createRoute({
    path: `${path}/:id/members`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Group:Read', 'User:Read'], true)] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(z.array(zGroupMember), 'Member List'),
    },
})

const GetGroupMembers: AppRouteHandler<typeof GetGroupMembersDef> = async (c) => {
    const params = c.req.valid('param')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload

    if (params.id !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Group members cannot be accessed',
        })
    }

    const data = await GroupCustomService.getGroupMembers(params.id)

    return c.json(
        {
            data,
            message: 'Group members fetched successfully',
            success: true,
        },
        OK,
    )
}

const AddGroupMembersDef = createRoute({
    path: `${path}/:id/members`,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Group:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(z.array(z.object({ userId: z.string(), roleId: z.string() })), 'Members'),
    },
    responses: {
        [OK]: ApiResponse(z.array(zGroupMember), 'Member List'),
    },
})

const AddGroupMembers: AppRouteHandler<typeof AddGroupMembersDef> = async (c) => {
    const params = c.req.valid('param')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload

    if (params.id !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Group members cannot be accessed',
        })
    }

    const members = c.req.valid('json')
    await GroupCustomService.addGroupMembers(params.id, members)
    const data = await GroupCustomService.getGroupMembers(params.id)

    return c.json(
        {
            data,
            message: 'Group members fetched successfully',
            success: true,
        },
        OK,
    )
}

const RemoveGroupMembersDef = createRoute({
    path: `${path}/:id/members`,
    tags,
    method: 'delete',
    middleware: [checkToken, checkPermission(['Group:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zIds, 'Members'),
    },
    responses: {
        [OK]: ApiResponse(z.array(zGroupMember), 'Member List'),
    },
})

const RemoveGroupMembers: AppRouteHandler<typeof RemoveGroupMembersDef> = async (c) => {
    const params = c.req.valid('param')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload

    if (params.id !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Group members cannot be accessed',
        })
    }

    const userIds = c.req.valid('json').ids
    await GroupCustomService.removeGroupMembers(params.id, userIds)
    const data = await GroupCustomService.getGroupMembers(params.id)

    return c.json(
        {
            data,
            message: 'Group members deleted successfully',
            success: true,
        },
        OK,
    )
}

const UpdateGroupMemberRoleDef = createRoute({
    path: `${path}/:id/members/:userId/role/:roleId`,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Group:Write'])] as const,
    request: {
        params: z.object({
            id: z.string(),
            userId: z.string(),
            roleId: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zGroupMember, 'Member'),
    },
})

const UpdateGroupMemberRole: AppRouteHandler<typeof UpdateGroupMemberRoleDef> = async (c) => {
    const params = c.req.valid('param')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload

    if (params.id !== groupId || !params.userId || !params.roleId) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Group members cannot be accessed',
        })
    }

    await GroupCustomService.addGroupMembers(params.id, [
        { userId: params.userId, roleId: params.roleId },
    ])
    const data = await GroupCustomService.getGroupMember(params.id, params.userId)

    if (!data) {
        throw new HTTPException(NOT_FOUND, {
            message: 'Group member not found',
        })
    }

    return c.json(
        {
            data,
            message: 'Group member updated successfully',
            success: true,
        },
        OK,
    )
}

const LeaveGroupMembershipDef = createRoute({
    path: `${path}/:id/members/:userId/leave`,
    tags,
    method: 'post',
    middleware: [checkToken] as const,
    request: {
        params: z.object({
            id: z.string(),
            userId: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Member'),
    },
})

const LeaveGroupMembership: AppRouteHandler<typeof LeaveGroupMembershipDef> = async (c) => {
    const params = c.req.valid('param')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload

    if (params.id !== groupId || !params.userId) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Group member cannot be accessed',
        })
    }

    try {
        await GroupCustomService.removeUserFromGroup(params.id, params.userId)
    } catch (error: unknown) {
        throw new HTTPException(
            ((error as Error)?.cause as ContentfulStatusCode) ?? INTERNAL_SERVER_ERROR,
            {
                message: error instanceof Error ? error.message : 'Error leaving group',
            },
        )
    }

    return c.json(
        {
            data: {},
            message: 'Group member updated successfully',
            success: true,
        },
        OK,
    )
}

export const groupCustomRoutes = createRouter()
    .openapi(GetMyGroupListDef, GetGroupListCrud)
    .openapi(SubscribePlanDef, SubscribePlan)
    .openapi(GetGroupMembersDef, GetGroupMembers)
    .openapi(AddGroupMembersDef, AddGroupMembers)
    .openapi(RemoveGroupMembersDef, RemoveGroupMembers)
    .openapi(UpdateGroupMemberRoleDef, UpdateGroupMemberRole)
    .openapi(LeaveGroupMembershipDef, LeaveGroupMembership)
