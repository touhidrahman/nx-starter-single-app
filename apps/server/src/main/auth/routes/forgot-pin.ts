import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { buildForgotPinEmailTemplate } from '../../email/templates/forgot-pin'
import { findUserById } from '../../user/user.service'
import { findUserSettings } from '../../user-settings/user-setting.service'

export const forgotPINCodeRoute = createRoute({
    path: '/v1/auth/forgot-pin',
    method: 'post',
    tags: ['User Settings'],
    middleware: [checkToken] as const,
    request: {},
    responses: {
        [OK]: ApiResponse(
            z.object({ success: z.boolean() }),
            'PIN sent successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid request or missing data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const forgotPINCodeHandler: AppRouteHandler<
    typeof forgotPINCodeRoute
> = async (c) => {
    try {
        const { sub } = await c.get('jwtPayload')

        const user = await findUserById(sub)
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

        if (!user.email) {
            return c.json(
                {
                    data: {},
                    message: 'Email not available for this user',
                    success: false,
                    error: null,
                    meta: null,
                },
                BAD_REQUEST,
            )
        }

        const userSetting = await findUserSettings(user.id, 'pinCode')
        if (userSetting?.value) {
            const emailData = buildForgotPinEmailTemplate({
                firstName: user.firstName,
                lastName: user.lastName,
                pin: userSetting.value,
            })

            await sendEmailUsingResend([user.email], 'Pin Code', emailData)

            return c.json(
                {
                    data: { success: true },
                    message: 'Pin code sent successfully!',
                    success: true,
                    error: null,
                    meta: null,
                },
                OK,
            )
        }

        return c.json(
            {
                data: {},
                message: 'User PIN not found',
                success: false,
            },
            BAD_REQUEST,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Internal Server Error',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
