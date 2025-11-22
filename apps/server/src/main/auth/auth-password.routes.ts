import { createRoute, z } from '@hono/zod-openapi'
import { attemptAsync } from 'es-toolkit'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { sendEmailUsingResend } from '../../email/email.service'
import env from '../../env'
import { checkToken } from '../../middlewares/check-token.middleware'
import { zEmpty } from '../../models/common.schema'
import { REQ_METHOD } from '../../models/common.values'
import { ApiResponse } from '../../utils/api-response.util'
import { buildForgotPasswordEmailTemplate } from '../email/templates/forgot-password'
import { buildPasswordChangeSuccessfulEmailTemplate } from '../email/templates/password-change-successful'
import { buildPasswordResetSuccessfulEmailTemplate } from '../email/templates/password-reset-successful'
import { UserCustomService } from '../user/custom/user-custom.service'
import { AuthService } from './auth.service'
import { zChangePassword, zResetPassword } from './auth.zod'
import { decodeVerificationToken } from './token.util'

const tags = ['Auth']
const path = '/auth'

const ChangePasswordDef = createRoute({
    path: `${path}/change-password`,
    tags,
    method: REQ_METHOD.POST,
    middleware: [checkToken] as const,
    request: {
        body: jsonContentRequired(zChangePassword, 'Change Password Data'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Success'),
    },
})

const ChangePassword: AppRouteHandler<typeof ChangePasswordDef> = async (c) => {
    try {
        const { userId, currentPassword, password } = c.req.valid('json')
        const data = await AuthService.changePassword(
            userId,
            currentPassword,
            password,
        )

        try {
            if (data.email) {
                const passwordChangeTemplate =
                    buildPasswordChangeSuccessfulEmailTemplate({
                        email: data.email,
                    })

                await sendEmailUsingResend(
                    [data.email],
                    'Password change',
                    passwordChangeTemplate,
                )
            }
        } catch (emailError) {
            c.var.logger.error(
                emailError,
                'Error sending password change email',
            )
        }

        return c.json(
            {
                data,
                message: 'Password changed successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        const cause = (error as Error & { cause?: ContentfulStatusCode }).cause
        throw new HTTPException(cause ?? BAD_REQUEST, {
            message: (error as Error).message,
        })
    }
}

const ForgotPasswordDef = createRoute({
    path: `${path}/forgot-password`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        body: jsonContentRequired(
            z.object({ identifier: z.string() }),
            'Identifier',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password reset email sent'),
    },
})

const ForgotPassword: AppRouteHandler<typeof ForgotPasswordDef> = async (c) => {
    try {
        const { identifier } = c.req.valid('json')

        const user = await UserCustomService.findByEmailOrUsername(identifier)
        if (!user) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'User with the given username does not exist',
            })
        }

        const [error, token] = await attemptAsync(
            async () =>
                await AuthService.createForgotPasswordToken(
                    user.id,
                    identifier,
                ),
        )

        let noEmailError = true
        if (user.email) {
            const forgotPasswordTemplate = buildForgotPasswordEmailTemplate({
                firstName: user.firstName,
                lastName: user.lastName,
                resetPasswordUrl: `${env.FRONTEND_URL}/reset-password?token=${token}`,
            })
            const { data, error: emailSendError } = await sendEmailUsingResend(
                [user.email],
                'Forgot Password?',
                forgotPasswordTemplate,
            )
            noEmailError = !emailSendError
        }

        if (error || !user?.id || !token || !noEmailError) {
            throw new HTTPException(BAD_REQUEST, {
                message:
                    (error as Error).message ??
                    'Could not create password reset token',
            })
        }

        return c.json(
            {
                data: {},
                message: 'Reset password email sent successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(BAD_REQUEST, {
            message: (error as Error).message,
        })
    }
}

const ResetPasswordDef = createRoute({
    path: `${path}/reset-password/:token`,
    tags,
    method: REQ_METHOD.POST,
    request: {
        params: z.object({ token: z.string() }),
        body: jsonContentRequired(zResetPassword, 'New password'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password reset success'),
    },
})

const ResetPassword: AppRouteHandler<typeof ResetPasswordDef> = async (c) => {
    const { email, password } = c.req.valid('json')
    const token = c.req.param('token') ?? ''
    const identifier = email.trim().toLowerCase()
    const user = await UserCustomService.findByEmailOrUsername(identifier)
    const decoded = await decodeVerificationToken(token)

    try {
        if (!decoded || !user || user.id !== decoded.userId) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'Invalid token',
            })
        }

        // custom service automatically hashes the password
        await UserCustomService.update(user.id, { password })

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
                data: {},
                message: 'Password reset success',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(BAD_REQUEST, {
            message: (error as Error).message,
        })
    }
}

export const authPasswordRoutes = createRouter()
    .openapi(ChangePasswordDef, ChangePassword)
    .openapi(ForgotPasswordDef, ForgotPassword)
    .openapi(ResetPasswordDef, ResetPassword)
