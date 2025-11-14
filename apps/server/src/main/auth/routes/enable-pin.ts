import { createRoute } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { zUserSettings } from '../../user-settings/user-setting.schema'
import {
    findUserSettings,
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

    const isPinEnabled = await findUserSettings(user.id, 'isPinEnabled')
    const isCurrentlyEnabled = isPinEnabled?.value === 'true'
    const newValue = isCurrentlyEnabled ? 'false' : 'true'

    await upsertUserSetting(user.id, { isPinEnabled: newValue })

    return c.json(
        {
            data: {
                settings: { isPinEnabled: newValue },
            },
            message: `Pin ${newValue === 'true' ? 'enabled' : 'disabled'} successfully!`,
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
