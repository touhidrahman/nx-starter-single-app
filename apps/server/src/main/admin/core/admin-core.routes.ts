import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { zInsertAdmin, zQueryAdmins, zSelectAdmin, zUpdateAdmin } from './admin-core.model'
import { AdminCoreService } from './admin-core.service'

const tags = [APP_OPENAPI_TAGS.Admin]
const path = '/core/admins'
const middleware = undefined // [checkToken, isAdmin]

const GetAdminListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryAdmins,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAdmin), 'Admin List'),
    },
})

const GetAdminListCore: AppRouteHandler<typeof GetAdminListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await AdminCoreService.findMany(query)
    const count = await AdminCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Admin list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetAdminByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAdmin, 'Admin details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Admin not found'),
    },
})

const GetAdminByIdCore: AppRouteHandler<typeof GetAdminByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const admin = await AdminCoreService.findById(id)

    if (!admin) {
        return c.json(
            {
                data: {},
                message: 'Admin not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: admin,
            message: 'Admin details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateAdminCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertAdmin, 'Admin Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAdmin, 'Admin created successfully'),
    },
})

const CreateAdminCore: AppRouteHandler<typeof CreateAdminCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newAdmin = await AdminCoreService.create(body)

    return c.json(
        {
            data: newAdmin,
            message: 'Admin created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateAdminCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateAdmin, 'Admin Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdmin, 'Admin updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Admin not found'),
    },
})

const UpdateAdminCore: AppRouteHandler<typeof UpdateAdminCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingAdmin = await AdminCoreService.findById(id)

    if (!existingAdmin) {
        return c.json(
            {
                data: {},
                message: 'Admin not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedAdmin = await AdminCoreService.update(id, body)

    return c.json(
        {
            data: updatedAdmin,
            message: 'Admin updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAdminCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Admin deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Admin not found'),
    },
})

const DeleteAdminCore: AppRouteHandler<typeof DeleteAdminCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingAdmin = await AdminCoreService.findById(id)

    if (!existingAdmin) {
        return c.json(
            {
                data: {},
                message: 'Admin not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await AdminCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'Admin deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyAdminCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'Admin IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Admins deleted successfully'),
    },
})

const DeleteManyAdminCore: AppRouteHandler<typeof DeleteManyAdminCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await AdminCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Admins deleted successfully',
            success: true,
        },
        OK,
    )
}

export const adminCoreRoutes = createRouter()
    .openapi(DeleteAdminCoreDef, DeleteAdminCore)
    .openapi(DeleteManyAdminCoreDef, DeleteManyAdminCore)
    .openapi(UpdateAdminCoreDef, UpdateAdminCore)
    .openapi(CreateAdminCoreDef, CreateAdminCore)
    .openapi(GetAdminByIdCoreDef, GetAdminByIdCore)
    .openapi(GetAdminListCoreDef, GetAdminListCore)
