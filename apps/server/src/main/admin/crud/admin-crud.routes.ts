import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { CryptoService } from '../../auth/crypto.service'
import { zInsertAdmin, zQueryAdmins, zSelectAdmin, zUpdateAdmin } from '../core/admin-core.model'
import { AdminCrudService } from './admin-crud.service'

const tags = [APP_OPENAPI_TAGS.Admin]
const path = '/crud/admins'

const GetAdminListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryAdmins,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAdmin), 'Admin List'),
    },
})

const GetAdminListCrud: AppRouteHandler<typeof GetAdminListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await AdminCrudService.findMany(query)
    const count = await AdminCrudService.count(query)

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

const GetAdminCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectAdmin, 'Item'),
    },
})

const GetAdminCrud: AppRouteHandler<typeof GetAdminCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const existing = await AdminCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Admin not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'Admin fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateAdminCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertAdmin, 'Input'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAdmin, 'Item'),
    },
})

const CreateAdminCrud: AppRouteHandler<typeof CreateAdminCrudDef> = async (c) => {
    const input = c.req.valid('json')
    const password = await CryptoService.hashPassword(input.password)
    const data = await AdminCrudService.create({ ...input, password })

    return c.json(
        {
            data,
            message: 'Admin created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateAdminCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateAdmin, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectAdmin, 'Item'),
    },
})

const UpdateAdminCrud: AppRouteHandler<typeof UpdateAdminCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const existing = await AdminCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Admin not found' })
    }

    const input = c.req.valid('json')
    const password = input.password
        ? await CryptoService.hashPassword(input.password)
        : existing.password

    const data = await AdminCrudService.update(existing.id, {
        ...input,
        password,
    })

    return c.json(
        {
            data,
            message: 'Admin updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteAdminCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteAdminCrud: AppRouteHandler<typeof DeleteAdminCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const existing = await AdminCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'Admin not found' })
    }
    await AdminCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'Admin deleted successfully',
            success: true,
        },
        OK,
    )
}

export const adminCrudRoutes = createRouter()
    .openapi(GetAdminListCrudDef, GetAdminListCrud)
    .openapi(CreateAdminCrudDef, CreateAdminCrud)
    .openapi(UpdateAdminCrudDef, UpdateAdminCrud)
    .openapi(DeleteAdminCrudDef, DeleteAdminCrud)
    .openapi(GetAdminCrudDef, GetAdminCrud)
