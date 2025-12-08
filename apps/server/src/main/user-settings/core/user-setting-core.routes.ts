import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { zEmpty } from '../../../models/common.schema'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import {
    zInsertUserSetting,
    zQueryUserSettings,
    zSelectUserSetting,
    zUpdateUserSetting,
} from './user-setting-core.model'
import { UserSettingCoreService } from './user-setting-core.service'

const tags = ['UserSettings']
const path = '/core/user-settings'
const middleware = undefined // [checkToken, isAdmin]

const GetUserSettingListCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        query: zQueryUserSettings,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectUserSetting), 'UserSetting List'),
    },
})

const GetUserSettingListCore: AppRouteHandler<typeof GetUserSettingListCoreDef> = async (c) => {
    const query = c.req.valid('query')
    const data = await UserSettingCoreService.findMany(query)
    const count = await UserSettingCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'UserSetting list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetUserSettingByIdCoreDef = createRoute({
    path: `${path}/:userId/:key`,
    tags,
    method: REQ_METHOD.GET,
    middleware,
    request: {
        params: z.object({
            userId: z.string(),
            key: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zSelectUserSetting, 'UserSetting details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'UserSetting not found'),
    },
})

const GetUserSettingByIdCore: AppRouteHandler<typeof GetUserSettingByIdCoreDef> = async (c) => {
    const { userId, key } = c.req.valid('param')
    const userSetting = await UserSettingCoreService.findByUserIdAndKey(userId, key)

    if (!userSetting) {
        return c.json(
            {
                data: {},
                message: 'UserSetting not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: userSetting,
            message: 'UserSetting details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateUserSettingCoreDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware,
    request: {
        body: jsonContent(zInsertUserSetting, 'UserSetting Create Data'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectUserSetting, 'UserSetting created successfully'),
    },
})

const CreateUserSettingCore: AppRouteHandler<typeof CreateUserSettingCoreDef> = async (c) => {
    const body = c.req.valid('json')
    const newUserSetting = await UserSettingCoreService.create(body)

    return c.json(
        {
            data: newUserSetting,
            message: 'UserSetting created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateUserSettingCoreDef = createRoute({
    path: `${path}/:userId/:key`,
    tags,
    method: REQ_METHOD.PUT,
    middleware,
    request: {
        params: z.object({
            userId: z.string(),
            key: z.string(),
        }),
        body: jsonContent(zUpdateUserSetting, 'UserSetting Update Data'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUserSetting, 'UserSetting updated successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'UserSetting not found'),
    },
})

const UpdateUserSettingCore: AppRouteHandler<typeof UpdateUserSettingCoreDef> = async (c) => {
    const { userId, key } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingUserSetting = await UserSettingCoreService.findByUserIdAndKey(userId, key)

    if (!existingUserSetting) {
        return c.json(
            {
                data: {},
                message: 'UserSetting not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedUserSetting = await UserSettingCoreService.update(userId, key, body)

    return c.json(
        {
            data: updatedUserSetting,
            message: 'UserSetting updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteUserSettingCoreDef = createRoute({
    path: `${path}/:userId/:key`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: z.object({
            userId: z.string(),
            key: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'UserSetting deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'UserSetting not found'),
    },
})

const DeleteUserSettingCore: AppRouteHandler<typeof DeleteUserSettingCoreDef> = async (c) => {
    const { userId, key } = c.req.valid('param')
    const existingUserSetting = await UserSettingCoreService.findByUserIdAndKey(userId, key)

    if (!existingUserSetting) {
        return c.json(
            {
                data: {},
                message: 'UserSetting not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await UserSettingCoreService.delete(userId, key)

    return c.json(
        {
            data: {},
            message: 'UserSetting deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteUserSettingsByUserIdCoreDef = createRoute({
    path: `${path}/user/:userId`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware,
    request: {
        params: z.object({
            userId: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'UserSettings deleted successfully'),
    },
})

const DeleteUserSettingsByUserId: AppRouteHandler<
    typeof DeleteUserSettingsByUserIdCoreDef
> = async (c) => {
    const { userId } = c.req.valid('param')

    await UserSettingCoreService.deleteByUserId(userId)

    return c.json(
        {
            data: {},
            message: 'UserSettings deleted successfully',
            success: true,
        },
        OK,
    )
}

export const userSettingCoreRoutes = createRouter()
    .openapi(DeleteUserSettingCoreDef, DeleteUserSettingCore)
    .openapi(DeleteUserSettingsByUserIdCoreDef, DeleteUserSettingsByUserId)
    .openapi(UpdateUserSettingCoreDef, UpdateUserSettingCore)
    .openapi(CreateUserSettingCoreDef, CreateUserSettingCore)
    .openapi(GetUserSettingByIdCoreDef, GetUserSettingByIdCore)
    .openapi(GetUserSettingListCoreDef, GetUserSettingListCore)
