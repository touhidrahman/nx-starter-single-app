import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    NOT_FOUND,
    OK,
    TOO_MANY_REQUESTS,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../core/core.type'
import { sendEmailUsingResend } from '../../email/email.service'
import env from '../../env'
import { buildForgotPasswordEmailTemplate } from '../../main/email/templates/forgot-password'
import { zEmpty } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { findUser } from '../auth.service'
import { createVerificationToken } from '../token.util'

const tags = ['Auth']

export const forgotPasswordRoute = createRoute({
    path: '/auth/forgot-password',
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
    const trimIdentifier = identifier.trim()

    const user = await findUser(trimIdentifier)

    if (!user) {
        return c.json(
            { message: 'User not found', data: {}, success: false },
            NOT_FOUND,
        )
    }

    const token = ''

    if (user.email) {
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
            [user.email],
            'Forgot Password?',
            forgotPasswordTemplate,
        )
        // TODO log email sending error

        return c.json({
            message: 'Password reset email sent',
            data: {},
            success: true,
        })
    }

    return c.json({
        message: 'User does not have an email. Please contact support.',
        data: {},
        success: false,
    })
}
