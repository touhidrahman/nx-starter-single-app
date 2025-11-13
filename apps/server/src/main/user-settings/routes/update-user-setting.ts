import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import {
    zSelectUserSettings,
    zUpdateUserSettings,
} from '../user-setting.schema'
import { upsertUserSetting } from '../user-setting.service'

export const userSettingsRoute = createRoute({
    path: '/v1/user-setting/:userId',
    method: 'put',
    tags: ['User Settings'],
    request: {
        params: z.object({ userId: z.string() }),
        body: jsonContent(zUpdateUserSettings, 'Update user settings'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUserSettings, 'Settings  successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid Settings data'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Settings not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const userSettingsHandler: AppRouteHandler<
    typeof userSettingsRoute
> = async (c) => {
    const { userId } = c.req.valid('param')
    const body = c.req.valid('json')

    try {
        const updatedSettings = await upsertUserSetting(userId, body)

        return c.json(
            {
                data: updatedSettings as any,
                message: 'Settings updated successfully',
                success: true,
                error: null,
                meta: null,
            },
            OK,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    message: 'Bad request',
                    success: false,
                    error: error.errors,
                },
                BAD_REQUEST,
            )
        }
        console.error('Error updating user settings:', error)
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
