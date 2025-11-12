import { createRoute, z } from '@hono/zod-openapi'
import { BAD_REQUEST, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import env from '../../../env'
import { buildEmailTemplateForInactiveUsers } from '../../email/templates/notification-for-inactive-users'
import { InactiveUser, zInactiveUsers } from '../auth.schema'
import { delay } from '../auth.service'

export const sendEmailToInactiveUsersRoute = createRoute({
    path: '/v1/user/inactive/:duration',
    method: 'post',
    tags: ['Auth'],
    request: {
        body: jsonContent(z.array(zInactiveUsers), 'Inactive users detail'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Email sent to users'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid input'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Invalid input'),
    },
})

export const sendEmailToInactiveUsersHandler: AppRouteHandler<
    typeof sendEmailToInactiveUsersRoute
> = async (c) => {
    const users = c.req.valid('json')
    const duration = c.req.param('duration')
    const days = parseDaysFromString(duration)

    try {
        if (!Array.isArray(users) || users.length === 0) {
            return c.json(
                {
                    data: {},
                    success: false,
                    message: 'No inactive users found.',
                    error: true,
                },
                NOT_FOUND,
            )
        }

        for (const user of users) {
            if (!isValidUserForEmail(user)) continue

            const { email, firstName, lastName } = user

            const resendVerificationEmail = buildEmailTemplateForInactiveUsers({
                firstName,
                lastName,
                email: email ?? '',
                loginUrl: `${env.FRONTEND_URL}/login`,
                days: days ?? 0,
            })

            const { data, error } = await sendEmailUsingResend(
                [email ?? ''],
                'Your account will be deleted',
                resendVerificationEmail,
            )

            if (!error) {
                //    TODO: Need to save user data
            }
        }

        //TODO: If not working above method than use this
        // const allResults: { email: string; success: boolean }[] = [];

        // for (let i = 0; i < users.length; i++) {
        //     const user = users[i];

        //     if (!isValidUserForEmail(user)) continue;

        //     const { email, firstName, lastName } = user;

        //     const resendVerificationEmail = buildEmailTemplateForInactiveUsers({
        //         firstName,
        //         lastName,
        //         email: email ?? '',
        //         loginUrl: `${env.FRONTEND_URL}/login`,
        //         days: days ?? 0,
        //     });

        //     const { data, error } = await sendEmailUsingResend(
        //         [email ?? ''],
        //         'Your account will be deleted',
        //         resendVerificationEmail,
        //     );

        //     allResults.push({ email, success: !error });

        //     // Delay 2 seconds before next email, except after last
        //     if (i < users.length - 1) {
        //         await delay(2000);
        //     }
        // }

        return c.json(
            {
                data: {},
                success: true,
                message: `Emails sent to ${users.length} inactive users.`,
                error: false,
            },
            OK,
        )
    } catch (error) {
        console.error('Error sending email to inactive users:', error)
        return c.json(
            {
                data: {},
                success: false,
                message: 'Failed to send emails to inactive users.',
                error: true,
            },
            BAD_REQUEST,
        )
    }
}

//NOTE: This helper method use only for this api
function isValidUserForEmail(user: InactiveUser): boolean {
    return Boolean(user?.email && user?.firstName && user?.lastName)
}

function parseDaysFromString(value: string): number | null {
    if (!value) return null
    const numberPart = value.split('-')[0].split(' ')[0].trim()
    const num = Number.parseInt(numberPart, 10)
    return isNaN(num) ? null : num
}
