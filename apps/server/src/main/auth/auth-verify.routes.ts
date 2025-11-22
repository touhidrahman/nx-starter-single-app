import { createRoute } from '@hono/zod-openapi'
import { and, eq } from 'drizzle-orm'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { db } from '../../db/db'
import { usersTable } from '../../db/schema'
import { sendEmailUsingResend } from '../../email/email.service'
import env from '../../env'
import { zEmpty } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { buildResendVerificationEmailTemplate } from '../email/templates/resend-email-verification'
import { UserCustomService } from '../user/custom/user-custom.service'
import { createVerificationToken, decodeVerificationToken } from './token.util'

const tags = ['Auth']

const VerifyEmailDef = createRoute({
    path: '/verify-email/:token',
    method: 'post',
    tags,
    request: {
        params: z.object({ token: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(z.object({ id: z.string() }), 'Email verified'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid or expired token'),
    },
})

const VerifyEmail: AppRouteHandler<typeof VerifyEmailDef> = async (c) => {
    const { token } = c.req.valid('param')
    const decoded = await decodeVerificationToken(token)
    if (!decoded?.email) {
        return c.json(
            {
                message: 'Invalid or expired token',
                data: {},
                success: false,
            },
            BAD_REQUEST,
        )
    }

    try {
        const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(
                and(
                    eq(usersTable.id, decoded.userId),
                    eq(usersTable.email, decoded.email),
                ),
            )
            .limit(1)

        if (!existingUser) {
            return c.json(
                {
                    message: 'User not found',
                    data: {},
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        if (existingUser.verifiedAt) {
            return c.json(
                {
                    success: true,
                    message: 'Email has already been verified',
                    data: { id: existingUser.id },
                },
                OK,
            )
        }

        const [user] = await db
            .update(usersTable)
            .set({ verifiedAt: new Date() })
            .where(
                and(
                    eq(usersTable.id, decoded.userId),
                    eq(usersTable.email, decoded.email),
                ),
            )
            .returning()

        return c.json(
            {
                success: true,
                message: 'Email verified successfully',
                data: { id: user?.id },
            },
            OK,
        )
    } catch (error) {
        return c.json(
            { message: 'Invalid token', success: false, data: {} },
            BAD_REQUEST,
        )
    }
}

const ResendVerificationEmailDef = createRoute({
    path: '/auth/resend-verification',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(
            z.object({
                email: z.email().max(100, 'Email is required'),
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

const ResendVerificationEmail: AppRouteHandler<
    typeof ResendVerificationEmailDef
> = async (c) => {
    try {
        const { email } = c.req.valid('json')
        const trimEmail = email.trim()

        const user = await UserCustomService.findByEmailOrUsername(trimEmail)
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
            const token = await createVerificationToken(
                user.id,
                {
                    unit: 'day',
                    value: 7,
                },
                email,
            )
            const tpl = await buildResendVerificationEmailTemplate({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
            })
            const { data, error } = await sendEmailUsingResend(
                [email],
                'Email Verification Link Sent',
                tpl,
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

export const authVerifyRoutes = createRouter()
    .openapi(VerifyEmailDef, VerifyEmail)
    .openapi(ResendVerificationEmailDef, ResendVerificationEmail)
