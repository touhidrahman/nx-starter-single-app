import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { zUserSettings } from '../user-setting.schema'
import { findUserSettingsByUserId } from '../user-setting.service'

export const getUsersSettingByUserIdRoute = createRoute({
    path: '/v1/user-setting',
    method: 'get',
    tags: ['User Settings'],
    middleware: [checkToken] as const,
    responses: {
        [OK]: ApiResponse(zUserSettings, 'User Settings '),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User setting not found'),
    },
})

export const getUsersSettingsByUserIdHandler: AppRouteHandler<
    typeof getUsersSettingByUserIdRoute
> = async (c) => {
    const payload = c.get('jwtPayload')

    const user = await findUserById(payload.sub)
    if (!user) {
        return c.json(
            {
                data: {},
                message: 'User Setting not found',
                success: false,
                error: null,
                meta: null,
            },
            NOT_FOUND,
        )
    }

    const userSetting = await findUserSettingsByUserId(user.id)

    const settingsObject = userSetting?.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {})

    return c.json(
        {
            data: { settings: settingsObject },
            message: 'User setting is successfully fetched',
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
