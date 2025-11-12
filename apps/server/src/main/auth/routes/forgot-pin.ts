import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { buildForgotPinEmailTemplate } from '../../email/templates/forgot-pin'
import { findUserById } from '../../user/user.service'
import { findUserSettingsByUserId } from '../../user-settings/user-setting.service'
import { sendVerificationCodeMsg } from '../auth.service'

export const forgotPINCodeRoute = createRoute({
    path: '/v1/auth/forgot-pin',
    method: 'post',
    tags: ['User Settings'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(
            z.object({ method: z.enum(['email', 'phone']) }),
            'Send PIN via Email or Phone',
        ),
    },
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
        const { method } = c.req.valid('json')

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

        const userSetting = await findUserSettingsByUserId(user.id)
        const result = userSetting.reduce(
            (acc, { userId, key, value }) => {
                acc.userId ??= userId
                acc[key] =
                    value === 'true' ? true : value === 'false' ? false : value
                return acc
            },
            {} as Record<string, any>,
        )

        if (method === 'email') {
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

            const emailData = buildForgotPinEmailTemplate({
                firstName: user.firstName,
                lastName: user.lastName,
                pin: result.pinCode,
            })

            await sendEmailUsingResend([user.email], 'Pin Code', emailData)
        }

        if (method === 'phone') {
            if (!user.phone) {
                return c.json(
                    {
                        data: {},
                        message: 'Phone number not available for this user',
                        success: false,
                        error: null,
                        meta: null,
                    },
                    BAD_REQUEST,
                )
            }

            await sendVerificationCodeMsg(
                `Your PIN is: ${result.pinCode}`,
                user.phone,
            )
        }

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
