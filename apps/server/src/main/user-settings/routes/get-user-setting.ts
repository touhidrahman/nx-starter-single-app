import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { zSelectUserSettings } from '../user-setting.schema'
import { findUserSettingsByUserId } from '../user-setting.service'

export const getUserSettingsRoute = createRoute({
    path: '/v1/user-settings',
    method: 'get',
    tags: ['User Settings'],
    middleware: [checkToken] as const,
    responses: {
        [OK]: ApiResponse(zSelectUserSettings, 'User Settings '),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User setting not found'),
    },
})

export const getUsersSettingsHandler: AppRouteHandler<
    typeof getUserSettingsRoute
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

    const userSettings = await findUserSettingsByUserId(user.id)

    const settingsObject: Record<string, string> = {}
    userSettings.forEach((setting) => {
        settingsObject[setting.key] = setting.value
    })

    return c.json(
        {
            data: settingsObject,
            message: 'User setting is successfully fetched',
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
