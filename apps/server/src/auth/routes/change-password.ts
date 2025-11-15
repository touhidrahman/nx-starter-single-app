import { createRoute } from '@hono/zod-openapi'
import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import { BAD_REQUEST, OK, UNAUTHORIZED } from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { db } from '../../db/db'
import { usersTable } from '../../db/schema'
import { sendEmailUsingResend } from '../../email/email.service'
import { buildPasswordChangeSuccessfulEmailTemplate } from '../../main/email/templates/password-change-successful'
import { findUserById } from '../../main/user/user.service'
import { zEmpty } from '../../models/common.schema'
import { ApiResponse } from '../../utils/api-response.util'
import { zChangePassword } from '../auth.schema'

const tags = ['Auth']

export const changePasswordRoute = createRoute({
    path: '/auth/change-password',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(zChangePassword, 'Change password details'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Password changed successfully'),
        [UNAUTHORIZED]: ApiResponse(zEmpty, 'Unauthorized'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Current password does not match'),
    },
})

export const changePasswordHandler: AppRouteHandler<
    typeof changePasswordRoute
> = async (c) => {
    const { userId } = c.req.valid('json')
    if (!userId) {
        return c.json(
            {
                message: 'Unauthorized',
                success: false,
                data: {},
                meta: null,
            },
            UNAUTHORIZED,
        )
    }

    const { currentPassword, password } = c.req.valid('json')

    const user = await findUserById(userId)

    if (!user) {
        return c.json(
            {
                message: 'User not found',
                success: false,
                data: {},
                meta: null,
            },
            UNAUTHORIZED,
        )
    }
    if (!user.email) {
        return c.json(
            {
                message: 'User does not have an email. Please contact support.',
                success: false,
                data: {},
                meta: null,
            },
            UNAUTHORIZED,
        )
    }

    // Verify the current password
    const currentPasswordMatches = await argon2.verify(
        user.password,
        currentPassword,
    )
    if (!currentPasswordMatches) {
        return c.json(
            {
                message: 'Current password does not match',
                success: false,
                data: {},
                meta: null,
            },
            BAD_REQUEST,
        )
    }

    // Hash the new password and update the database
    const hashedPassword = await argon2.hash(password)
    await db
        .update(usersTable)
        .set({ password: hashedPassword })
        .where(eq(usersTable.id, userId))

    try {
        const passwordChangeTemplate =
            buildPasswordChangeSuccessfulEmailTemplate({
                email: user.email,
            })

        await sendEmailUsingResend(
            [user.email],
            'Password change',
            passwordChangeTemplate,
        )
    } catch (emailError) {
        c.var.logger.error(emailError, 'Error sending password change email')
    }

    return c.json(
        {
            message: 'Password changed successfully',
            data: {},
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
