import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CONFLICT,
    CREATED,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiResponse } from '../../../utils/api-response.util'
import { trimLowercase } from '../../../utils/string.util'
import { getAllAdmins } from '../../admin/admin-user.service'
import { createGroup } from '../../group/group.service'
import {
    createReferral,
    findReferralCodeRecord,
} from '../../referral/refferal.service'
import { InsertUser, zRegister, zSelectAuthUser } from '../auth.schema'
import {
    addUserToGroup,
    createUser,
    emailExists,
    sendUpdateStatusEmailToAdmin,
    sendVerificationEmail,
    usernameExists,
} from '../auth.service'

const tags = [APP_OPENAPI_TAGS.Auth]

export const registerRoute = createRoute({
    path: '/auth/register',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(zRegister, 'User registration details'),
        query: z.object({ ref: z.string().optional() }),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectAuthUser, 'User registration successful'),
        [CONFLICT]: ApiResponse(zEmpty, 'Email already exists'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const registerHandler: AppRouteHandler<typeof registerRoute> = async (
    c,
) => {
    const queryParam = c.req.query()
    const payload = c.req.valid('json')
    const {
        email,
        phone,
        password,
        firstName,
        lastName,
        username,
        referralCode,
        organization,
    } = payload

    const refCode = referralCode || queryParam.ref

    try {
        const normalizedEmail = trimLowercase(email)
        const normalizedUsername = trimLowercase(username)

        if (normalizedEmail) {
            const emailAlreadyExists = await emailExists(normalizedEmail)
            const usernameAlreadyExists =
                await usernameExists(normalizedUsername)
            if (emailAlreadyExists || usernameAlreadyExists) {
                return c.json(
                    {
                        message: emailAlreadyExists
                            ? 'Email already exists'
                            : 'Username already exists',
                        data: {},
                        success: false,
                        error: 'Conflict',
                    },
                    CONFLICT,
                )
            }
        }

        const createUserData: InsertUser = {
            username: normalizedUsername,
            phone: phone?.trim() || null,
            email: normalizedEmail || null,
            password: password,
            firstName,
            lastName,
        }

        const user = await createUser(createUserData)

        if (!user) {
            return c.json(
                {
                    message: 'Failed to create user',
                    data: {},
                    success: false,
                    error: 'Failed to create user',
                    meta: null,
                },
                BAD_REQUEST,
            )
        }

        const [group] = await createGroup({
            name: organization || `${firstName} ${lastName}'s Organization`,
            email: normalizedEmail ?? '',
            phone: phone,
            creatorId: user.id,
        })

        await addUserToGroup(user.id, group?.id ?? '', 'owner') // TODO: use roleId here

        if (email) {
            const { error } = await sendVerificationEmail(
                email,
                user.firstName,
                user.lastName,
                user.id,
                organization ?? '',
            )
            if (error) {
                c.var.logger.error('Failed to send verification email')
            }
        }

        const { data: admins } = await getAllAdmins({ page: 1, size: 100 })
        const adminEmails = admins.map((admin) => admin.email)
        await sendUpdateStatusEmailToAdmin(user, group, adminEmails)

        if (refCode) {
            const [referralCode] = await findReferralCodeRecord(refCode)

            if (!referralCode) {
                c.var.logger.error(
                    'Invalid referral code but register successful',
                )
            }
            await createReferral(referralCode.id, user.id)
        }

        return c.json(
            {
                data: user,
                message: 'Account created',
                success: true,
                error: null,
                meta: null,
            },
            CREATED,
        )
    } catch (e) {
        return c.json(
            {
                data: {},
                error: e,
                message: 'Registration failed. Please try again.',
                success: false,
                meta: null,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
