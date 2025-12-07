import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty, zId, zIds } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { zInsertUser, zQueryUsers, zSelectUser, zUpdateUser } from './user-core.model'
import { UserCoreService } from './user-core.service'

const tags = [APP_OPENAPI_TAGS.User]
const path = '/core/users'
const middleware = undefined // [checkToken, isAdmin]

const GetUserListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryUsers,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectUser), 'User List'),
    },
})

const GetUserListCore: AppRouteHandler<typeof GetUserListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await UserCoreService.findMany(query)
    const count = await UserCoreService.count(query)

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

const GetUserByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'User details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

const GetUserByIdCore: AppRouteHandler<typeof GetUserByIdCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const user = await UserCoreService.findById(id)

    if (!user) {
        return c.json(
            {
                data: {},
                message: 'User not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: user,
            message: 'User details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateUserCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertUser, 'User Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectUser, 'User created successfully'),
    },
})

const CreateUserCore: AppRouteHandler<typeof CreateUserCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newUser = await UserCoreService.create(body)

    return c.json(
        {
            data: newUser,
            message: 'User created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateUserCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: zId,
        body: jsonContent(zUpdateUser, 'User Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'User updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

const UpdateUserCore: AppRouteHandler<typeof UpdateUserCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingUser = await UserCoreService.findById(id)

    if (!existingUser) {
        return c.json(
            {
                data: {},
                message: 'User not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedUser = await UserCoreService.update(id, body)

    return c.json(
        {
            data: updatedUser,
            message: 'User updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteUserCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'User deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

const DeleteUserCore: AppRouteHandler<typeof DeleteUserCoreDef> = async (c) => {
    const { id } = c.req.valid('param')
    const existingUser = await UserCoreService.findById(id)

    if (!existingUser) {
        return c.json(
            {
                data: {},
                message: 'User not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await UserCoreService.delete(id)

    return c.json(
        {
            data: {},
            message: 'User deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyUserCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        body: jsonContent(zIds, 'User IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Users deleted successfully'),
    },
})

const DeleteManyUserCore: AppRouteHandler<typeof DeleteManyUserCoreDef> = async (c) => {
    const { ids } = c.req.valid('json')

    await UserCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'Users deleted successfully',
            success: true,
        },
        OK,
    )
}

export const userCoreRoutes = createRouter()
    .openapi(DeleteUserCoreDef, DeleteUserCore)
    .openapi(DeleteManyUserCoreDef, DeleteManyUserCore)
    .openapi(UpdateUserCoreDef, UpdateUserCore)
    .openapi(CreateUserCoreDef, CreateUserCore)
    .openapi(GetUserByIdCoreDef, GetUserByIdCore)
    .openapi(GetUserListCoreDef, GetUserListCore)
