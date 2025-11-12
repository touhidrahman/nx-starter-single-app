import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { zUserSettings } from '../../user-settings/user-setting.schema'
import {
    findUserSettingsByUserId,
    upsertUserSetting,
} from '../../user-settings/user-setting.service'

export const enablePinRoute = createRoute({
    path: '/v1/auth/enable-pin',
    method: 'post',
    tags: ['User Settings'],
    middleware: [checkToken] as const,
    responses: {
        [OK]: ApiResponse(zUserSettings, 'User verification'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const enablePinHandler: AppRouteHandler<typeof enablePinRoute> = async (
    c,
) => {
    const payload = c.get('jwtPayload')

    const user = await findUserById(payload.sub)
    if (!user) {
        return c.json(
            {
                data: {},
                message: 'User not found',
                success: false,
                error: null,
                meta: null,
            },
            NOT_FOUND,
        )
    }

    const userSetting = await findUserSettingsByUserId(user.id)

    const settingsObject: Record<string, string> = userSetting?.reduce(
        (acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        },
        {} as Record<string, string>,
    )

    const isCurrentlyEnabled = settingsObject?.isPinEnabled === 'true'

    const newValue = isCurrentlyEnabled ? 'false' : 'true'

    await upsertUserSetting(user.id, { isPinEnabled: newValue })

    const updatedSettings = await findUserSettingsByUserId(user.id)
    const updatedSettingsObject = updatedSettings?.reduce(
        (acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        },
        {} as Record<string, string>,
    )

    return c.json(
        {
            data: {
                settings: updatedSettingsObject,
            },
            message: `Pin ${newValue === 'true' ? 'enabled' : 'disabled'} successfully!`,
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
