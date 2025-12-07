import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { FORBIDDEN, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import {
    zInsertUserSetting,
    zQueryUserSettings,
    zSelectUserSetting,
    zUpdateUserSetting,
} from '../core/user-setting-core.model'
import { UserSettingCrudService } from './user-setting-crud.service'

const tags = ['UserSettings']
const path = '/crud/user-settings'

const GetUserSettingListCrudDef = createRoute({
    path: path,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['UserSetting:Read'])] as const,
    request: {
        query: zQueryUserSettings,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectUserSetting), 'UserSetting List'),
    },
})

const GetUserSettingListCrud: AppRouteHandler<typeof GetUserSettingListCrudDef> = async (c) => {
    const query = c.req.valid('query')
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const userSpecificQuery = { ...query, userId }
    const data = await UserSettingCrudService.findMany(userSpecificQuery)
    const count = await UserSettingCrudService.count(userSpecificQuery)

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

const GetUserSettingCrudDef = createRoute({
    path: `${path}/:key`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken, checkPermission(['UserSetting:Read'])] as const,
    request: {
        params: z.object({
            key: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zSelectUserSetting, 'Item'),
    },
})

const GetUserSettingCrud: AppRouteHandler<typeof GetUserSettingCrudDef> = async (c) => {
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const { key } = c.req.valid('param')

    const existing = await UserSettingCrudService.findByUserIdAndKey(userId, key)
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'UserSetting not found',
        })
    }

    return c.json(
        {
            data: existing,
            message: 'UserSetting fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateUserSettingCrudDef = createRoute({
    path,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken, checkPermission(['UserSetting:Write'])] as const,
    request: {
        body: jsonContent(zInsertUserSetting, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUserSetting, 'Item'),
    },
})

const CreateUserSettingCrud: AppRouteHandler<typeof CreateUserSettingCrudDef> = async (c) => {
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const input = c.req.valid('json')

    if (!userId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'UserSetting could not be created',
        })
    }

    const data = await UserSettingCrudService.create({
        ...input,
        userId,
    })

    return c.json(
        {
            data,
            message: 'UserSetting created successfully',
            success: true,
        },
        OK,
    )
}

const UpdateUserSettingCrudDef = createRoute({
    path: `${path}/:key`,
    tags,
    method: REQ_METHOD.PUT,
    middleware: [checkToken, checkPermission(['UserSetting:Write'])] as const,
    request: {
        params: z.object({
            key: z.string(),
        }),
        body: jsonContent(zUpdateUserSetting, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUserSetting, 'Item'),
    },
})

const UpdateUserSettingCrud: AppRouteHandler<typeof UpdateUserSettingCrudDef> = async (c) => {
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const { key } = c.req.valid('param')

    const existing = await UserSettingCrudService.findByUserIdAndKey(userId, key)
    if (!existing) {
        throw new HTTPException(FORBIDDEN, {
            message: 'UserSetting cannot be updated',
        })
    }

    const input = c.req.valid('json')
    const data = await UserSettingCrudService.update(userId, key, {
        ...input,
        userId,
    })

    return c.json(
        {
            data,
            message: 'UserSetting updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteUserSettingCrudDef = createRoute({
    path: `${path}/:key`,
    tags,
    method: REQ_METHOD.DELETE,
    middleware: [checkToken, checkPermission(['UserSetting:Delete'])] as const,
    request: {
        params: z.object({
            key: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Item'),
    },
})

const DeleteUserSettingCrud: AppRouteHandler<typeof DeleteUserSettingCrudDef> = async (c) => {
    const { sub: userId } = c.get('jwtPayload') as AccessTokenPayload
    const { key } = c.req.valid('param')

    const existing = await UserSettingCrudService.findByUserIdAndKey(userId, key)
    if (!existing) {
        throw new HTTPException(FORBIDDEN, {
            message: 'UserSetting cannot be deleted',
        })
    }

    await UserSettingCrudService.delete(userId, key)

    return c.json(
        {
            data: {},
            message: 'UserSetting deleted successfully',
            success: true,
        },
        OK,
    )
}

export const userSettingCrudRoutes = createRouter()
    .openapi(GetUserSettingListCrudDef, GetUserSettingListCrud)
    .openapi(CreateUserSettingCrudDef, CreateUserSettingCrud)
    .openapi(UpdateUserSettingCrudDef, UpdateUserSettingCrud)
    .openapi(DeleteUserSettingCrudDef, DeleteUserSettingCrud)
    .openapi(GetUserSettingCrudDef, GetUserSettingCrud)
