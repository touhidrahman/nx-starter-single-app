import { createRoute } from '@hono/zod-openapi'
import { random } from 'radash'
import {
    BAD_REQUEST,
    NOT_FOUND,
    OK,
    TOO_MANY_REQUESTS,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import env from '../../../env'
import { buildForgotPasswordEmailTemplate } from '../../email/templates/forgot-password'
import { USER_VERIFICATION_TYPE_VALUES } from '../../user-verification/user-verification.schema'
import {
    findUserVerificationById,
    upsertResetCode,
} from '../../user-verification/user-verification.service'
import {
    findUser,
    sendVerificationCodeMsg,
    validateCountdown,
    validateIdentifier,
} from '../auth.service'
import { createVerificationToken } from '../token.util'

const tags = ['Auth']

export const forgotPasswordRoute = createRoute({
    path: '/v1/forgot-password',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(
            z.object({ identifier: z.string() }),
            'Identifier',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password reset email sent'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [TOO_MANY_REQUESTS]: ApiResponse(
            zEmpty,
            'Please wait before requesting another verification code',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const forgotPasswordHandler: AppRouteHandler<
    typeof forgotPasswordRoute
> = async (c) => {
    const { identifier } = c.req.valid('json')
    const identifierResult = validateIdentifier(identifier ?? '')
    const isEmail = identifierResult.type === 'email'

    const trimIdentifier = identifier.trim()

    if (identifierResult.isValid === false) {
        return c.json(
            {
                success: false,
                message: 'Invalid phone number or email',
                data: {},
            },
            BAD_REQUEST,
        )
    }

    const user = await findUser(trimIdentifier)

    if (!user) {
        return c.json(
            { message: 'User not found', data: {}, success: false },
            NOT_FOUND,
        )
    }

    let token = ''

    if (isEmail) {
        const token = await createVerificationToken(
            user.id.toString(),
            { unit: 'day', value: 2 },
            identifier,
            '',
        )

        const forgotPasswordTemplate = buildForgotPasswordEmailTemplate({
            firstName: user.firstName,
            lastName: user.lastName,
            resetPasswordUrl: `${env.FRONTEND_URL}/new-password/${token}`,
        })
        const { data, error } = await sendEmailUsingResend(
            [user.email ?? ''],
            'Forgot Password?',
            forgotPasswordTemplate,
        )
        // TODO log email sending error
    } else {
        const userVerificationDetails = await findUserVerificationById(
            user?.id ?? '',
            trimIdentifier,
            USER_VERIFICATION_TYPE_VALUES.resetPassword,
        )
        if (userVerificationDetails?.createdAt) {
            const countdownCheck = validateCountdown(
                userVerificationDetails.createdAt,
            )
            if (!countdownCheck.allowed) {
                return c.json(
                    {
                        success: false,
                        message: `${countdownCheck.message}`,
                        data: {},
                    },
                    TOO_MANY_REQUESTS,
                )
            }
        }
        const expiresIn = 20 * 60
        const passwordResetCode = random(100000, 999999)
        const expiresNewDateTime = new Date(Date.now() + expiresIn * 1000)
        await upsertResetCode(
            user.id,
            trimIdentifier,
            passwordResetCode,
            expiresNewDateTime,
        )

        const message = `Your MyApp password reset code is: ${passwordResetCode}.`
        const { error } = await sendVerificationCodeMsg(message, trimIdentifier)

        token = await createVerificationToken(
            user.id.toString(),
            { unit: 'day', value: 2 },
            '',
            identifier,
        )
    }

    return c.json({
        message: isEmail
            ? 'Password reset email sent'
            : 'Verification code sent',
        data: {
            token: token,
            isPhone: !isEmail,
        },
        success: true,
    })
}
