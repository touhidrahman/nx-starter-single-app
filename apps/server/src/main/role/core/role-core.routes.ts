import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { zInsertRole, zQueryRoles, zSelectRole, zUpdateRole } from './role-core.model'
import { RoleCoreService } from './role-core.service'

const tags = [APP_OPENAPI_TAGS.Role]
const path = '/core/roles'
const middleware = undefined // [checkToken, isAdmin]

const GetRoleListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: {
        query: zQueryRoles,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectRole), 'Role List'),
    },
})

const GetRoleListCore: AppRouteHandler<typeof GetRoleListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await RoleCoreService.findMany(query)
    const count = await RoleCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Role list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetRoleByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Role details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Role not found'),
    },
})

const GetRoleByIdCore: AppRouteHandler<typeof GetRoleByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const role = await RoleCoreService.findById(id)

    if (!role) {
        return c.json(
            {
                data: {},
                message: 'Role not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: role,
            message: 'Role details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateRoleCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: {
        body: jsonContent(zInsertRole, 'Role Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectRole, 'Role created successfully'),
    },
})

const CreateRoleCore: AppRouteHandler<typeof CreateRoleCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newRole = await RoleCoreService.create(body)

    return c.json(
        {
            data: newRole,
            message: 'Role created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateRoleCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateRole, 'Role Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Role updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Role not found'),
    },
})

const UpdateRoleCore: AppRouteHandler<typeof UpdateRoleCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingRole = await RoleCoreService.findById(id)

    if (!existingRole) {
        return c.json(
            {
                data: {},
                message: 'Role not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedRole = await RoleCoreService.update(id, body)

    return c.json(
        {
            data: updatedRole,
            message: 'Role updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteRoleCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Role deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Role not found'),
    },
})

const DeleteRoleCore: AppRouteHandler<typeof DeleteRoleCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingRole = await RoleCoreService.findById(id)

    if (!existingRole) {
        return c.json(
            {
                data: {},
                message: 'Role not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await RoleCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Role deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyRoleCoreDef = createRoute({
    path,
    tags,
    method: 'delete',
    middleware,
    request: {
        body: jsonContent(zIds, 'Role IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Roles deleted successfully'),
    },
})

const DeleteManyRoleCore: AppRouteHandler<typeof DeleteManyRoleCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await RoleCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Roles deleted successfully',
            success: true,
        },
        OK,
    )
}

export const roleCoreRoutes = createRouter()
    .openapi(DeleteRoleCoreDef, DeleteRoleCore)
    .openapi(DeleteManyRoleCoreDef, DeleteManyRoleCore)
    .openapi(UpdateRoleCoreDef, UpdateRoleCore)
    .openapi(CreateRoleCoreDef, CreateRoleCore)
    .openapi(GetRoleByIdCoreDef, GetRoleByIdCore)
    .openapi(GetRoleListCoreDef, GetRoleListCore)
