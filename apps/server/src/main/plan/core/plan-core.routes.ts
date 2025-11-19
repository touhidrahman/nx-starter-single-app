import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertPlan,
    zQueryPlans,
    zSelectPlan,
    zUpdatePlan,
} from './plan-core.model'
import { PlanCoreService } from './plan-core.service'

const tags = ['Plans']
const path = '/core/plans'
const middleware = undefined // [checkToken, isAdmin]

const GetPlanListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryPlans,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectPlan), 'Plan List'),
    },
})

const GetPlanListCore: AppRouteHandler<typeof GetPlanListCoreDef> = async (
    c,
) => {
    const query = c.req.valid('query')
    const data = await PlanCoreService.findMany(query)
    const count = await PlanCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Plan list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetPlanByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectPlan, 'Plan details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Plan not found'),
    },
})

const GetPlanByIdCore: AppRouteHandler<typeof GetPlanByIdCoreDef> = async (
    c,
) => {
    const { id } = c.req.valid('param')
    const plan = await PlanCoreService.findById(id)

    if (!plan) {
        return c.json(
            {
                data: {},
                message: 'Plan not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: plan,
            message: 'Plan details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreatePlanCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertPlan, 'Plan Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectPlan, 'Plan created successfully'),
    },
})

const CreatePlanCore: AppRouteHandler<typeof CreatePlanCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newPlan = await PlanCoreService.create(body)

    return c.json(
        {
            data: newPlan,
            message: 'Plan created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdatePlanCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdatePlan, 'Plan Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectPlan, 'Plan updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Plan not found'),
    },
})

const UpdatePlanCore: AppRouteHandler<typeof UpdatePlanCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingPlan = await PlanCoreService.findById(id)

    if (!existingPlan) {
        return c.json(
            {
                data: {},
                message: 'Plan not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedPlan = await PlanCoreService.update(id, body)

    return c.json(
        {
            data: updatedPlan,
            message: 'Plan updated successfully',
            success: true,
        },
        OK,
    )
}

const DeletePlanCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Plan deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Plan not found'),
    },
})

const DeletePlanCore: AppRouteHandler<typeof DeletePlanCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingPlan = await PlanCoreService.findById(id)

    if (!existingPlan) {
        return c.json(
            {
                data: {},
                message: 'Plan not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await PlanCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Plan deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyPlanCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Plan IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Plans deleted successfully'),
    },
})

const DeleteManyPlanCore: AppRouteHandler<
    typeof DeleteManyPlanCoreDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await PlanCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Plans deleted successfully',
            success: true,
        },
        OK,
    )
}

export const planCoreRoutes = createRouter()
    .openapi(DeletePlanCoreDef, DeletePlanCore)
    .openapi(DeleteManyPlanCoreDef, DeleteManyPlanCore)
    .openapi(UpdatePlanCoreDef, UpdatePlanCore)
    .openapi(CreatePlanCoreDef, CreatePlanCore)
    .openapi(GetPlanByIdCoreDef, GetPlanByIdCore)
    .openapi(GetPlanListCoreDef, GetPlanListCore)
