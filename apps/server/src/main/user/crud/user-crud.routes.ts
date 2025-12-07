import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { CryptoService } from '../../auth/crypto.service'
import { zInsertUser, zQueryUsers, zSelectUser, zUpdateUser } from '../core/user-core.model'
import { UserCrudService } from './user-crud.service'

const tags = [APP_OPENAPI_TAGS.User]
const path = '/crud/users'

const GetUserListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryUsers,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectUser), 'User List'),
    },
})

const GetUserListCrud: AppRouteHandler<typeof GetUserListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const groupSpecificQuery = { ...query, groupId }
    const data = await UserCrudService.findMany(groupSpecificQuery)
    const count = await UserCrudService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'User list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetUserCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Item'),
    },
})

const GetUserCrud: AppRouteHandler<typeof GetUserCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const existing = await UserCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'User not found' })
    }

    return c.json(
        {
            data: existing,
            message: 'User fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateUserCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertUser, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Item'),
    },
})

const CreateUserCrud: AppRouteHandler<typeof CreateUserCrudDef> = async (c) => {
    const input = c.req.valid('json')
    const password = await CryptoService.hashPassword(input.password)
    const data = await UserCrudService.create({ ...input, password })

    return c.json(
        {
            data,
            message: 'User created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateUserCrudDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateUser, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Item'),
    },
})

const UpdateUserCrud: AppRouteHandler<typeof UpdateUserCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const existing = await UserCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'User not found' })
    }

    const input = c.req.valid('json')
    const password = input.password ? await CryptoService.hashPassword(input.password) : undefined
    const data = await UserCrudService.update(existing.id, {
        ...input,
        password,
    })

    return c.json(
        {
            data,
            message: 'User updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteUserCrudDef = createRoute({
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

const DeleteUserCrud: AppRouteHandler<typeof DeleteUserCrudDef> = async (c) => {
    const id = c.req.valid('param').id
    const existing = await UserCrudService.findById(id)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, { message: 'User not found' })
    }
    await UserCrudService.delete(existing.id)

    return c.json(
        {
            data: {},
            message: 'User deleted successfully',
            success: true,
        },
        OK,
    )
}

export const userCrudRoutes = createRouter()
    .openapi(GetUserListCrudDef, GetUserListCrud)
    .openapi(CreateUserCrudDef, CreateUserCrud)
    .openapi(UpdateUserCrudDef, UpdateUserCrud)
    .openapi(DeleteUserCrudDef, DeleteUserCrud)
    .openapi(GetUserCrudDef, GetUserCrud)
