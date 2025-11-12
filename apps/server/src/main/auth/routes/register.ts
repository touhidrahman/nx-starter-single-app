import { createRoute, z } from '@hono/zod-openapi'
import { random } from 'radash'
import {
    BAD_REQUEST,
    CONFLICT,
    CREATED,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from 'stoker/http-status-codes'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { getAllAdmins } from '../../admin/admin-user.service'
import {
    ClientManager,
    ClientMember,
    VendorClerk,
    VendorLawyer,
    VendorOwner,
} from '../../claim/claims'
import {
    findGroupById,
    findOwnedGroupByType,
    setDefaultGroup,
} from '../../group/group.service'
import { deleteInvitationByEmail } from '../../invite/invite.service'
import {
    createReferral,
    findReferralCodeRecord,
} from '../../referral/refferal.service'
import { SelectRole } from '../../role/role.schema'
import { upsertSystemRole } from '../../role/role.service'
import {
    findActiveSubscriptionByGroupId,
    updateById,
} from '../../subscription/subscriptions.service'
import {
    InsertUserVerification,
    USER_VERIFICATION_TYPE_VALUES,
} from '../../user-verification/user-verification.schema'
import { createUserVerification } from '../../user-verification/user-verification.service'
import { CreateUserSchema, zRegister } from '../auth.schema'
import {
    addUserToGroup,
    createUser,
    createUserOrganization,
    emailExists,
    phoneExists,
    sendUpdateStatusEmailToAdmin,
    sendVerificationCodeMsg,
    sendVerificationEmail,
    subscribeToFreePlan,
    usernameExists,
} from '../auth.service'
import { createGeneralToken } from '../token.util'

const tags = ['Auth']

export const registerRoute = createRoute({
    path: '/v1/register',
    method: 'post',
    tags,
    request: {
        body: jsonContentRequired(zRegister, 'User registration details'),
        query: z.object({ ref: z.string().optional() }),
    },
    responses: {
        [CREATED]: ApiResponse(
            z.object({
                id: z.string(),
                registeredBy: z.string(),
                token: z.string(),
            }),
            'User registration successful',
        ),
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
        defaultGroupId,
        role,
        referralCode,
        organization,
    } = payload

    const refCode = referralCode || queryParam.ref

    try {
        if (!email && !phone) {
            return c.json(
                {
                    message: 'Email or phone is required',
                    data: {},
                    success: false,
                    error: 'Email or phone is required',
                    meta: null,
                },
                BAD_REQUEST,
            )
        }

        const normalizedEmail = email ? email.trim().toLowerCase() : null
        const normalizedPhone = phone ? phone.trim() : null

        if (normalizedEmail) {
            const emailAlreadyExists = await emailExists(normalizedEmail)
            const emailAsUsernameExists = await usernameExists(normalizedEmail)

            if (emailAlreadyExists || emailAsUsernameExists) {
                return c.json(
                    {
                        message: emailAlreadyExists
                            ? 'Email already exists'
                            : 'Email is already used as username',
                        data: {},
                        success: false,
                        error: 'Conflict',
                        meta: null,
                    },
                    CONFLICT,
                )
            }
        }

        if (normalizedPhone) {
            const phoneAlreadyExists = await phoneExists(normalizedPhone)
            const phoneAsUsernameExists =
                !normalizedEmail && (await usernameExists(normalizedPhone))

            if (phoneAlreadyExists || phoneAsUsernameExists) {
                return c.json(
                    {
                        message: phoneAlreadyExists
                            ? 'Phone number already registered'
                            : 'Phone number is already used as username',
                        data: {},
                        success: false,
                        error: 'Conflict',
                        meta: null,
                    },
                    CONFLICT,
                )
            }
        }

        const username = normalizedEmail ?? normalizedPhone ?? ''

        const createUserData: z.infer<typeof CreateUserSchema> = {
            username,
            phone: normalizedPhone || null,
            email: normalizedEmail || null,
            password: password,
            firstName,
            lastName,
            verified: false,
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
                NOT_FOUND,
            )
        }

        let groupId: string
        let groupType: string
        let groupName: string

        if (role && defaultGroupId && defaultGroupId.trim() !== '') {
            await addUserToGroup(user.id, defaultGroupId, role)
            await setDefaultGroup(user.id, defaultGroupId)

            await deleteInvitationByEmail(email ?? '')

            const existingGroup = await findGroupById(defaultGroupId)
            groupId = defaultGroupId
            groupType = existingGroup?.type || 'unknown'
            groupName = existingGroup?.name || 'Existing Group'
        } else {
            const ownedGroupByType = await findOwnedGroupByType(
                user.id,
                organization.groupType,
            )

            if (ownedGroupByType) {
                return c.json(
                    {
                        success: false,
                        message: `You already have a ${organization.groupType} organization which you own. Cannot create another one.`,
                        data: {},
                        error: `You already have a ${organization.groupType} organization which you own`,
                        meta: null,
                    },
                    BAD_REQUEST,
                )
            }
            const { group, organizationName } = await createUserOrganization(
                user,
                organization,
            )

            groupId = group.id
            groupType = organization.groupType
            groupName = organizationName

            if (organization.groupType === 'vendor') {
                const { success, message } = await subscribeToFreePlan(group.id)
                if (!success) {
                    c.var.logger.warn(
                        `Failed to subscribe group ${group.id} to free plan: ${message}`,
                    )
                }
            }

            // everytime a user registers, update the default system role so that any new claims are added
            // to the system role. This is to ensure that the system role always has the latest claims.
            // This will not create a new system role if it already exists.
            let systemRoleOwner: SelectRole

            if (groupType === 'vendor') {
                systemRoleOwner = await upsertSystemRole(
                    VendorOwner,
                    'vendor',
                    'Owner role can manage almost everything in the organization.',
                )
                await upsertSystemRole(
                    VendorLawyer,
                    'vendor',
                    'Lawyer role can perform day to day activities in the organization',
                )
                await upsertSystemRole(
                    VendorClerk,
                    'vendor',
                    'Clerk role cannot perform critical activities in the organization such as deleting cases, adding/removing members, etc.',
                )
            } else {
                systemRoleOwner = await upsertSystemRole(
                    ClientManager,
                    'client',
                    'Manager role can manage almost everything in the organization.',
                )
                await upsertSystemRole(
                    ClientMember,
                    'client',
                    'Member role can perform day to day activities in the organization.',
                )
            }

            await addUserToGroup(user.id, group.id, systemRoleOwner.id)
            await setDefaultGroup(user.id, group.id)
        }

        if (email) {
            const { error } = await sendVerificationEmail(
                email,
                user.firstName,
                user.lastName,
                user.id,
                groupType,
                groupName,
            )
            if (error) {
                c.var.logger.error('Failed to send verification email')
            }
        }

        const { data: admins } = await getAllAdmins({ page: 1, size: 100 })
        const adminEmails = admins.map((admin) => admin.email)
        await sendUpdateStatusEmailToAdmin(
            user,
            {
                id: groupId,
                name: groupName,
                type: groupType as 'client' | 'vendor',
            },
            adminEmails,
        )

        let phoneVerificationToken = ''

        if (phone) {
            const verificationCode = random(100000, 999999)
            const expiresIn = 20 * 60
            const expiredAt = new Date(Date.now() + expiresIn * 1000)
            const saveVerificationCode: InsertUserVerification = {
                phone: phone ?? '',
                type: USER_VERIFICATION_TYPE_VALUES.registration,
                userId: user.id,
                verificationCode: verificationCode,
                expiresAt: expiredAt,
            }
            await createUserVerification(saveVerificationCode)
            const message = `Your MyApp verification code is: ${verificationCode}.`
            const { error } = await sendVerificationCodeMsg(message, phone)

            phoneVerificationToken = await createGeneralToken(phone, expiresIn)

            if (error) {
                c.var.logger.error('Failed to send verification SMS')
            }
        }

        const registeredBy = phone ? 'phone' : 'email'

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
                data: {
                    id: user.id,
                    registeredBy: registeredBy,
                    token: phone ? phoneVerificationToken : '',
                },
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
