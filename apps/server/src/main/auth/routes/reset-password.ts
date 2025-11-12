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
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { buildPasswordResetSuccessfulEmailTemplate } from '../../email/templates/password-reset-successful'
import { USER_VERIFICATION_TYPE_VALUES } from '../../user-verification/user-verification.schema'
import { findUserVerificationById } from '../../user-verification/user-verification.service'
import { zResetPassword } from '../auth.schema'
import {
    findUser,
    sendVerificationCodeMsg,
    updateUserPassword,
    validateIdentifier,
} from '../auth.service'
import { decodeVerificationToken } from '../token.util'

const tags = ['Auth']

export const resetPasswordRoute = createRoute({
    path: '/v1/reset-password/:token',
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
    const { email, password, phone, code } = c.req.valid('json')
    const token = c.req.param('token') ?? ''
    const identifier = email || phone
    const user = await findUser(identifier)
    const decoded = await decodeVerificationToken(token)

    try {
        const validation = validateIdentifier(identifier)
        const isPhone = validation.type === 'phone'

        if (!validation.isValid) {
            return c.json(
                {
                    message: isPhone ? 'Invalid phone number' : 'Invalid email',
                    data: {},
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        if (!decoded || !user || user.id !== decoded.userId) {
            return c.json(
                { message: 'Invalid token', data: {}, success: false },
                BAD_REQUEST,
            )
        }

        const mobileResetCode = code && code.length === 6 ? Number(code) : 0

        const hashedPassword = await argon2.hash(password)

        if (!isPhone && mobileResetCode === 0) {
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
        }

        if (isPhone && mobileResetCode !== 0) {
            const userVerificationDetails = await findUserVerificationById(
                user?.id ?? '',
                user.phone ?? '',
                USER_VERIFICATION_TYPE_VALUES.resetPassword,
            )
            const passwordResetCode = userVerificationDetails?.verificationCode

            if (
                !userVerificationDetails ||
                passwordResetCode !== mobileResetCode
            ) {
                return c.json(
                    {
                        message: 'Invalid reset code',
                        data: {},
                        success: false,
                    },
                    BAD_REQUEST,
                )
            }

            await updateUserPassword(user.id, hashedPassword)
            const { error } = await sendVerificationCodeMsg(
                'Your password has been successfully reset',
                user?.phone ?? '',
            )
        }
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
