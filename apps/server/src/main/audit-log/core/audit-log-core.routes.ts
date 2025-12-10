import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertAuditLog,
    zQueryAuditLogs,
    zSelectAuditLog,
    zUpdateAuditLog,
} from './audit-log-core.model'
import { AuditLogCoreService } from './audit-log-core.service'

const tags = [APP_OPENAPI_TAGS.AuditLog]
const path = '/core/audit-logs'
const middleware = undefined // [checkToken, isAdmin]

const GetAuditLogListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: {
        query: zQueryAuditLogs,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAuditLog), 'AuditLog List'),
    },
})

const GetAuditLogListCore: AppRouteHandler<typeof GetAuditLogListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await AuditLogCoreService.findMany(query)
    const count = await AuditLogCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'AuditLog list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetAuditLogByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAuditLog, 'AuditLog details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AuditLog not found'),
    },
})

const GetAuditLogByIdCore: AppRouteHandler<typeof GetAuditLogByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const auditLog = await AuditLogCoreService.findById(id)

    if (!auditLog) {
        return c.json(
            {
                data: {},
                message: 'AuditLog not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: auditLog,
            message: 'AuditLog details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateAuditLogCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: {
        body: jsonContent(zInsertAuditLog, 'AuditLog Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAuditLog, 'AuditLog created successfully'),
    },
})

const CreateAuditLogCore: AppRouteHandler<typeof CreateAuditLogCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newAuditLog = await AuditLogCoreService.create(body)

    return c.json(
        {
            data: newAuditLog,
            message: 'AuditLog created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateAuditLogCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateAuditLog, 'AuditLog Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAuditLog, 'AuditLog updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AuditLog not found'),
    },
})

const UpdateAuditLogCore: AppRouteHandler<typeof UpdateAuditLogCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingAuditLog = await AuditLogCoreService.findById(id)

    if (!existingAuditLog) {
        return c.json(
            {
                data: {},
                message: 'AuditLog not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedAuditLog = await AuditLogCoreService.update(id, body)

    return c.json(
        {
            data: updatedAuditLog,
            message: 'AuditLog updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAuditLogCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'AuditLog deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'AuditLog not found'),
    },
})

const DeleteAuditLogCore: AppRouteHandler<typeof DeleteAuditLogCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingAuditLog = await AuditLogCoreService.findById(id)

    if (!existingAuditLog) {
        return c.json(
            {
                data: {},
                message: 'AuditLog not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await AuditLogCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'AuditLog deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyAuditLogCoreDef = createRoute({
    path,
    tags,
    method: 'delete',
    middleware,
    request: {
        body: jsonContent(zIds, 'AuditLog IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'AuditLogs deleted successfully'),
    },
})

const DeleteManyAuditLogCore: AppRouteHandler<typeof DeleteManyAuditLogCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await AuditLogCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'AuditLogs deleted successfully',
            success: true,
        },
        OK,
    )
}

export const auditLogCoreRoutes = createRouter()
    .openapi(DeleteAuditLogCoreDef, DeleteAuditLogCore)
    .openapi(DeleteManyAuditLogCoreDef, DeleteManyAuditLogCore)
    .openapi(UpdateAuditLogCoreDef, UpdateAuditLogCore)
    .openapi(CreateAuditLogCoreDef, CreateAuditLogCore)
    .openapi(GetAuditLogByIdCoreDef, GetAuditLogByIdCore)
    .openapi(GetAuditLogListCoreDef, GetAuditLogListCore)
