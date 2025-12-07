import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { zInsertPlan, zQueryPlans, zSelectPlan, zUpdatePlan } from '../core/plan-core.model'
import { PlanCrudService } from './plan-crud.service'

const tags = ['Plans']
const path = '/crud/plans'

const GetPlanListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['Plan:Read'])] as const,
    request: {
        query: zQueryPlans,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectPlan), 'Plan List'),
    },
})

const GetPlanListCrud: AppRouteHandler<typeof GetPlanListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await PlanCrudService.findMany(query)
    const count = await PlanCrudService.count(query)

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

const GetPlanCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['Plan:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectPlan, 'Item'),
    },
})

const GetPlanCrud: AppRouteHandler<typeof GetPlanCrudDef> = async (c) => {
    const id = c.req.valid('param').id

    const existing = await PlanCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Plan not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Plan fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreatePlanCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken, checkPermission(['Plan:Write'])] as const,
    request: {
        body: jsonContent(zInsertPlan, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectPlan, 'Item'),
    },
})

const CreatePlanCrud: AppRouteHandler<typeof CreatePlanCrudDef> = async (c) => {
    const input = c.req.valid('json')

    const data = await PlanCrudService.create(input)

    return c.json(
        {
            data,
            message: 'Plan created successfully',
            success: true,
        },
        OK,
    )
}

const UpdatePlanCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken, checkPermission(['Plan:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdatePlan, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectPlan, 'Item'),
    },
})

const UpdatePlanCrud: AppRouteHandler<typeof UpdatePlanCrudDef> = async (c) => {
    const id = c.req.valid('param').id

    const existing = await PlanCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'Plan cannot be updated',
        })
    }

    const input = c.req.valid('json')
    const data = await PlanCrudService.update(existing.id, input)

    return c.json(
        {
            data,
            message: 'Plan updated successfully',
            success: true,
        },
        OK,
    )
}

const DeletePlanCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken, checkPermission(['Plan:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeletePlanCrud: AppRouteHandler<typeof DeletePlanCrudDef> = async (c) => {
    const id = c.req.valid('param').id

    const existing = await PlanCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'Plan cannot be deleted',
        })
    }

    await PlanCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Plan deleted successfully',
            success: true,
        },
        OK,
    )
}

export const planCrudRoutes = createRouter()
    .openapi(GetPlanListCrudDef, GetPlanListCrud)
    .openapi(CreatePlanCrudDef, CreatePlanCrud)
    .openapi(UpdatePlanCrudDef, UpdatePlanCrud)
    .openapi(DeletePlanCrudDef, DeletePlanCrud)
    .openapi(GetPlanCrudDef, GetPlanCrud)
