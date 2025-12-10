import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zInsertRole, zQueryRoles, zSelectRole, zUpdateRole } from '../core/role-core.model'
import { RoleCrudService } from './role-crud.service'

const tags = [APP_OPENAPI_TAGS.Role]
const path = '/crud/roles'

const GetRoleListCrudDef = createRoute({
    path: path,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Role:Read'])] as const,
    request: {
        query: zQueryRoles,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectRole), 'Role List'),
    },
})

const GetRoleListCrud: AppRouteHandler<typeof GetRoleListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await RoleCrudService.findMany(groupSpecificQuery)
    const count = await RoleCrudService.count(groupSpecificQuery)

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

const GetRoleCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Role:Read'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Item'),
    },
})

const GetRoleCrud: AppRouteHandler<typeof GetRoleCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await RoleCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(NOT_FOUND, { message: 'Role not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Role fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateRoleCrudDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware: [checkToken, checkPermission(['Role:Write'])] as const,
    request: {
        body: jsonContent(zInsertRole, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Item'),
    },
})

const CreateRoleCrud: AppRouteHandler<typeof CreateRoleCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Role could not be created',
        })
    }

    const data = await RoleCrudService.create({
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Role created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateRoleCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware: [checkToken, checkPermission(['Role:Write'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateRole, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Item'),
    },
})

const UpdateRoleCrud: AppRouteHandler<typeof UpdateRoleCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await RoleCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Role cannot be updated',
        })
    }

    const input = c.req.valid('json')
    const data = await RoleCrudService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'Role updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteRoleCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware: [checkToken, checkPermission(['Role:Delete'])] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteRoleCrud: AppRouteHandler<typeof DeleteRoleCrudDef> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    const existing = await RoleCrudService.findById(id)
    if (!existing || existing.groupId !== groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'Role cannot be deleted',
        })
    }

    await RoleCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Role deleted successfully',
            success: true,
        },
        OK,
    )
}

export const roleCrudRoutes = createRouter()
    .openapi(GetRoleListCrudDef, GetRoleListCrud)
    .openapi(CreateRoleCrudDef, CreateRoleCrud)
    .openapi(UpdateRoleCrudDef, UpdateRoleCrud)
    .openapi(DeleteRoleCrudDef, DeleteRoleCrud)
    .openapi(GetRoleCrudDef, GetRoleCrud)
