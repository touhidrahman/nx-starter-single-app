import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertAuditLog,
    zQueryAuditLogs,
    zSelectAuditLog,
    zUpdateAuditLog,
} from '../core/audit-log-core.model'
import { AuditLogCrudService } from './audit-log-crud.service'

const tags = [APP_OPENAPI_TAGS.AuditLog]
const path = '/crud/audit-logs'

const GetAuditLogListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['Logs:Read'])] as const,
    request: {
        query: zQueryAuditLogs,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAuditLog), 'AuditLog List'),
    },
})

const GetAuditLogListCrud: AppRouteHandler<
    typeof GetAuditLogListCrudDef
> = async (c) => {
    const query = c.req.valid('query')
    const { sub: creatorId, groupId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const creatorSpecificQuery = { ...query, creatorId, groupId }
    const data = await AuditLogCrudService.findMany(creatorSpecificQuery)
    const count = await AuditLogCrudService.count(creatorSpecificQuery)

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

const GetAuditLogCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['Logs:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAuditLog, 'Item'),
    },
})

const GetAuditLogCrud: AppRouteHandler<typeof GetAuditLogCrudDef> = async (
    c,
) => {
    const { sub: creatorId, groupId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await AuditLogCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'AuditLog not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'AuditLog fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateAuditLogCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken, checkPermission(['Logs:Write'])] as const,
    request: {
        body: jsonContent(zInsertAuditLog, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAuditLog, 'Item'),
    },
})

const CreateAuditLogCrud: AppRouteHandler<
    typeof CreateAuditLogCrudDef
> = async (c) => {
    const { sub: creatorId, groupId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    const data = await AuditLogCrudService.create({
        ...input,
        creatorId,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'AuditLog created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateAuditLogCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken, checkPermission(['Logs:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAuditLog, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAuditLog, 'Item'),
    },
})

const UpdateAuditLogCrud: AppRouteHandler<
    typeof UpdateAuditLogCrudDef
> = async (c) => {
    const { sub: creatorId, groupId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await AuditLogCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'AuditLog cannot be updated',
        })
    }

    const input = c.req.valid('json')
    const data = await AuditLogCrudService.update(existing.id, {
        ...input,
        creatorId,
    })

    return c.json(
        {
            data,
            message: 'AuditLog updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAuditLogCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken, checkPermission(['Logs:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteAuditLogCrud: AppRouteHandler<
    typeof DeleteAuditLogCrudDef
> = async (c) => {
    const { sub: creatorId, groupId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await AuditLogCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'AuditLog cannot be deleted',
        })
    }

    await AuditLogCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'AuditLog deleted successfully',
            success: true,
        },
        OK,
    )
}

export const auditLogCrudRoutes = createRouter()
    .openapi(GetAuditLogListCrudDef, GetAuditLogListCrud)
    .openapi(CreateAuditLogCrudDef, CreateAuditLogCrud)
    .openapi(UpdateAuditLogCrudDef, UpdateAuditLogCrud)
    .openapi(DeleteAuditLogCrudDef, DeleteAuditLogCrud)
    .openapi(GetAuditLogCrudDef, GetAuditLogCrud)
