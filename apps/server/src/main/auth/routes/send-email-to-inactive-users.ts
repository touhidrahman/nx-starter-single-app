// import { createRoute, z } from '@hono/zod-openapi'
// import { BAD_REQUEST, NOT_FOUND, OK } from 'stoker/http-status-codes'
// import { jsonContent } from 'stoker/openapi/helpers'
// import { AppRouteHandler } from '../../../core/core.type'
// import { sendEmailUsingResend } from '../../../core/email/email.service'
// import { zEmpty } from '../../../core/models/common.schema'
// import { ApiResponse } from '../../../core/utils/api-response.util'
// import env from '../../../env'
// import { buildEmailTemplateForInactiveUsers } from '../../email/templates/notification-for-inactive-users'
// import { InactiveUser, zInactiveUsers } from '../auth.schema'
// import { db } from '../../../core/db/db'
// import { usersTable } from '../../../core/db/schema'
// import { eq } from 'drizzle-orm'

// export const sendEmailToInactiveUsersRoute = createRoute({
//     path: '/v1/auth/send-email-to-inactive-users',
//     method: 'post',
//     tags: ['Auth'],
//     request: {
//         body: jsonContent(zInactiveUsers, 'Inactive users detail'),
//     },
//     responses: {
//         [OK]: ApiResponse(zEmpty, 'Email sent to users'),
//         [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid input'),
//         [NOT_FOUND]: ApiResponse(zEmpty, 'Invalid input'),
//     },
// })

// export const sendEmailToInactiveUsersHandler: AppRouteHandler<
//     typeof sendEmailToInactiveUsersRoute
// > = async (c) => {
//     const body = c.req.valid('json')

//     try {
//         const { inactiveForDays, lastEmailElapsedDays } = body
//         const users = await db.select().from(usersTable).where(
//             and(
//                 eq(usersTable.lastLogin, ),
//             )
//         )

//         for (const user of users) {
//             if (!isValidUserForEmail(user)) continue

//             const { email, firstName, lastName } = user

//             const resendVerificationEmail = buildEmailTemplateForInactiveUsers({
//                 firstName,
//                 lastName,
//                 email: email ?? '',
//                 loginUrl: `${env.FRONTEND_URL}/login`,
//                 days: days ?? 0,
//             })

//             const { data, error } = await sendEmailUsingResend(
//                 [email ?? ''],
//                 'Your account will be deleted',
//                 resendVerificationEmail,
//             )

//             if (!error) {
//                 //    TODO: Need to save user data
//             }
//         }

//         return c.json(
//             {
//                 data: {},
//                 success: true,
//                 message: `Emails sent to ${users.length} inactive users.`,
//                 error: false,
//             },
//             OK,
//         )
//     } catch (error) {
//         console.error('Error sending email to inactive users:', error)
//         return c.json(
//             {
//                 data: {},
//                 success: false,
//                 message: 'Failed to send emails to inactive users.',
//                 error: true,
//             },
//             BAD_REQUEST,
//         )
//     }
// }

// //NOTE: This helper method use only for this api
// function isValidUserForEmail(user: InactiveUser): boolean {
//     return Boolean(user?.email && user?.firstName && user?.lastName)
// }

// function parseDaysFromString(value: string): number | null {
//     if (!value) return null
//     const numberPart = value.split('-')[0].split(' ')[0].trim()
//     const num = Number.parseInt(numberPart, 10)
//     return isNaN(num) ? null : num
// }
