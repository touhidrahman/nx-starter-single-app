import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { zEmpty } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { findUserByEmail, resendVerificationEmail } from '../auth.service'

const tags = ['Auth']

export const resendVerificationRoute = createRoute({
    path: '/auth/resend-verification',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(
            z.object({
                email: z.string().max(100, 'Email is required'),
            }),
            'Send email verification request',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Verification mail sent successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Email already verified'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Unverified user not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmpty,
            'Failed to send verification mail',
        ),
    },
})

export const resendVerificationHandler: AppRouteHandler<
    typeof resendVerificationRoute
> = async (c) => {
    try {
        const { email } = c.req.valid('json')
        const trimEmail = email.trim()

        const user = await findUserByEmail(trimEmail)
        if (!user) {
            return c.json(
                {
                    success: false,
                    message: 'User not found',
                    data: {},
                },
                NOT_FOUND,
            )
        }

        if (user.email && !user.verifiedAt) {
            const { error, data } = await resendVerificationEmail(
                user?.email ?? '',
                user?.firstName,
                user?.lastName,
                user?.id,
            )
            if (error) {
                return c.json(
                    {
                        success: false,
                        message: 'Failed to send email verification mail',
                        data: {},
                    },
                    INTERNAL_SERVER_ERROR,
                )
            }
            return c.json(
                {
                    success: true,
                    message: 'Verification email sent successfully',
                    data: {},
                },
                OK,
            )
        }
        return c.json(
            {
                success: false,
                message: 'Email already verified',
                data: {},
            },
            BAD_REQUEST,
        )
    } catch (e) {
        c.var.logger.error('Failed to send verification code')
        return c.json(
            {
                success: false,
                message: 'Failed to send verification code',
                data: {},
                error: e instanceof Error ? e.stack : e,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
