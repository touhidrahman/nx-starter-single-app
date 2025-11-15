import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../email/email.service'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { buildPasswordResetSuccessfulEmailTemplate } from '../../email/templates/password-reset-successful'
import { zResetPassword } from '../auth.schema'
import { findUserByEmail, updateUserPassword } from '../auth.service'
import { decodeVerificationToken } from '../token.util'

const tags = ['Auth']

export const resetPasswordRoute = createRoute({
    path: '/auth/reset-password/:token',
    method: 'post',
    tags,
    request: {
        params: z.object({ token: z.string() }),
        body: jsonContentRequired(zResetPassword, 'New password'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password reset success'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Error resetting password'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmpty,
            'Error resetting password',
        ),
    },
})

export const resetPasswordHandler: AppRouteHandler<
    typeof resetPasswordRoute
> = async (c) => {
    const { email, password } = c.req.valid('json')
    const token = c.req.param('token') ?? ''
    const identifier = email.trim().toLowerCase()
    const user = await findUserByEmail(identifier)
    const decoded = await decodeVerificationToken(token)

    try {
        if (!decoded || !user || user.id !== decoded.userId) {
            return c.json(
                { message: 'Invalid token', data: {}, success: false },
                BAD_REQUEST,
            )
        }

        const hashedPassword = await argon2.hash(password)

        await updateUserPassword(user.id, hashedPassword)

        const passwordResetSuccessfulTemplate =
            buildPasswordResetSuccessfulEmailTemplate({
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
            })

        const { data, error } = await sendEmailUsingResend(
            [email],
            'Your Password Has Been Successfully Reset',
            passwordResetSuccessfulTemplate,
        )

        return c.json(
            {
                message: 'Password reset success',
                data: {},
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                message: 'Error resetting password',
                data: {},
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
