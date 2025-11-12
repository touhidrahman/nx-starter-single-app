import * as argon2 from 'argon2'
import { and, count, eq, or, sql } from 'drizzle-orm'
import { random } from 'radash'
import z from 'zod'
import { db } from '../../core/db/db'
import { lower } from '../../core/db/orm.util'
import { rolesTable, usersGroupsTable, usersTable } from '../../core/db/schema'
import { sendEmailUsingResend } from '../../core/email/email.service'
import { DateUtil } from '../../core/utils/date.util'
import env from '../../env'
import { SelectAdmin } from '../admin/admin.schema'
import { buildAdminNotificationTemplate } from '../email/templates/group-status-update-notification'
import { buildSuccessEmailTemplate } from '../email/templates/success-template'
import { buildWelcomeEmailTemplate } from '../email/templates/welcome'
import { Group } from '../group/group.schema'
import {
    createGroup,
    findGroupById,
    updateSubscriptionId,
} from '../group/group.service'
import { getStarterPlan } from '../plan/plan.service'
import { SelectRole } from '../role/role.schema'
import { InsertSubscription } from '../subscription/subscription.schema'
import { createSubscription } from '../subscription/subscriptions.service'
import { User } from '../user/user.schema'
import {
    CountdownValidationResult,
    CreateUserSchema,
    SMSResponse,
    UserCreateResult,
} from './auth.schema'
import { createVerificationToken } from './token.util'

export async function updateLastLogin(userId: string) {
    const dateUtil = DateUtil
    await db
        .update(usersTable)
        .set({ lastLogin: dateUtil.date() })
        .where(eq(usersTable.id, userId))
}

export async function isFirstUser() {
    const userCount = await db.select({ value: count() }).from(usersTable)

    return userCount?.[0]?.value === 0
}

export async function emailExists(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const results = await db
        .select({ count: count() })
        .from(usersTable)
        .where(eq(lower(usersTable.email), normalizedEmail))
        .limit(1)
    return Boolean(results?.[0]?.count ?? 0)
}

export async function phoneExists(phone: string) {
    const normalizedPhone = phone.trim()
    const results = await db
        .select({ count: count() })
        .from(usersTable)
        .where(eq(usersTable.phone, normalizedPhone))
        .limit(1)
    return Boolean(results?.[0]?.count ?? 0)
}

export async function findUserByEmail(email: string) {
    const results = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)

    return results?.[0] ?? null
}
export async function findUserByPhone(phone: string) {
    const results = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phone, phone))
        .limit(1)

    return results?.[0] ?? null
}

export async function findUnverifiedUserByPhoneEmail(
    identifier: string,
    isEmail: boolean,
) {
    const condition = isEmail
        ? and(eq(usersTable.email, identifier), eq(usersTable.verified, false))
        : and(eq(usersTable.phone, identifier), eq(usersTable.verified, false))

    const [user] = await db.select().from(usersTable).where(condition).limit(1)

    return user ?? null
}

export async function findVerifiedUserByPhoneEmail(
    identifier: string,
    isEmail: boolean,
) {
    const condition = isEmail
        ? and(eq(usersTable.email, identifier), eq(usersTable.verified, true))
        : and(eq(usersTable.phone, identifier), eq(usersTable.verified, true))

    const [user] = await db.select().from(usersTable).where(condition).limit(1)

    return user ?? null
}

export async function setDefaultGroupId(
    userId: string,
    groupId: string | null,
) {
    return db
        .update(usersTable)
        .set({ defaultGroupId: groupId, lastLogin: DateUtil.date() })
        .where(eq(usersTable.id, userId))
        .returning()
}

export async function getRoleByUserAndGroup(
    userId: string,
    groupId: string,
): Promise<SelectRole | null> {
    const [userGroupRelation] = await db
        .select({
            roleId: usersGroupsTable.roleId,
        })
        .from(usersGroupsTable)
        .where(
            and(
                eq(usersGroupsTable.groupId, groupId),
                eq(usersGroupsTable.userId, userId),
            ),
        )
        .execute()

    if (!userGroupRelation?.roleId) {
        return null
    }

    const [role] = await db
        .select()
        .from(rolesTable)
        .where(eq(rolesTable.id, userGroupRelation.roleId))
        .execute()

    return role ?? null
}

// Find user by ID
export async function findUserById(userId: string) {
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)
    return user
}

// Add user to a group with a role
export async function addUserToGroup(
    userId: string,
    groupId: string,
    roleId: string,
) {
    const [userGroup] = await db
        .insert(usersGroupsTable)
        .values({ groupId, userId, roleId })
        .returning()

    return userGroup
}

// Update user's default group
export async function updateUserDefaultGroup(userId: string, groupId: string) {
    const [user] = await db
        .update(usersTable)
        .set({ defaultGroupId: groupId })
        .where(eq(usersTable.id, userId))
        .returning()
    return user
}

export async function sendProfileCreatedEmail(user: User, group: Group) {
    const createProfileSuccessTpl = buildSuccessEmailTemplate({
        recipientName: `${user.firstName} ${user.lastName}`,
        profileType: group.type,
        dashboardUrl: `${env.FRONTEND_URL}/`,
        loginUrl: `${env.FRONTEND_URL}/login`,
        organizationName: group.name,
    })

    const { data, error } = await sendEmailUsingResend(
        [user.email ?? ''],
        'Profile created successfully.',
        createProfileSuccessTpl,
    )
}

export async function subscribeToFreePlan(groupId: string) {
    // find free plan and create subscription
    const data = await getStarterPlan()

    if (!data) {
        return { success: false, message: 'Free plan not found' }
    }

    const startDate = new Date()
    let endDate: Date

    endDate = new Date(startDate)
    endDate.setMonth(startDate.getMonth() + 1)

    const newSubscription: InsertSubscription = {
        status: 'active',
        subscriptionType: 'monthly',
        planId: data.id,
        groupId: groupId,
        startDate,
        endDate,
        usedStorage: 0,
    }

    const [subscription] = await createSubscription(newSubscription)

    await updateSubscriptionId(groupId, subscription.id)

    if (subscription) {
        return {
            success: true,
            message: 'Group subscribed to free plan successfully',
        }
    }
    return {
        success: false,
        message: 'Failed to subscribe group to free plan',
    }
}

export async function sendUpdateStatusEmailToAdmin(
    user: User,
    group: Group,
    adminEmails: string[],
) {
    const adminNotificationTpl = buildAdminNotificationTemplate({
        groupId: group.id,
        groupName: group.name,
        groupType: group.type,
        creatorName: `${user.firstName} ${user.lastName}`,
        creatorEmail: user.email ?? user.phone ?? '',
        url:
            env.FRONTEND_URL + '/admin',
        status: 'active',
    })

    const { data, error } = await sendEmailUsingResend(
        adminEmails,
        `[Admin] New group (${group.name}) created at ${new Date().toLocaleDateString()}`,
        adminNotificationTpl,
    )

    if (error) {
        console.error('Failed to send admin notification email:', error)
    }

    return { data, error }
}

export const verifyUser = async (phone: string) => {
    const [user] = await db
        .update(usersTable)
        .set({
            verified: true,
        })
        .where(and(eq(usersTable.phone, phone), eq(usersTable.verified, false)))
        .returning()
    return user
}

export async function findUser(phoneEmailOrUsername: string) {
    const results = await db
        .select()
        .from(usersTable)
        .where(
            or(
                eq(usersTable.username, phoneEmailOrUsername),
                eq(usersTable.email, phoneEmailOrUsername),
                eq(usersTable.phone, phoneEmailOrUsername),
            ),
        )
        .limit(1)
    return results?.[0] ?? null
}

export async function sendVerificationEmail(
    email: string,
    firstName: string,
    lastName: string,
    userId: string,
    groupType: string,
    groupName: string,
) {
    const token = await createVerificationToken(
        userId,
        {
            unit: 'day',
            value: 7,
        },
        email,
    )

    if (env.NODE_ENV !== 'production') {
        console.info(`Verification token for ${email}: ${token}`)
    }

    const addressToSendEmail =
        env.NODE_ENV === 'production' ? email : env.EMAIL_TEST_EMAIL

    const welcomeEmail = buildWelcomeEmailTemplate({
        firstName,
        lastName,
        email: addressToSendEmail ?? '',
        verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
        groupType,
        groupName,
    })

    return sendEmailUsingResend(
        [addressToSendEmail ?? ''],
        'Please verify your email',
        welcomeEmail,
    )
}

export async function resendVerificationEmail(
    email: string,
    firstName: string,
    lastName: string,
    userId: string,
) {
    const token = await createVerificationToken(
        userId,
        {
            unit: 'day',
            value: 7,
        },
        email,
    )

    if (env.NODE_ENV !== 'production') {
        console.info(`Verification token for ${email}: ${token}`)
    }

    const addressToSendEmail =
        env.NODE_ENV !== 'production' ? env.EMAIL_TEST_EMAIL : email

    // const resendVerificationEmail = buildResendVerificationEmailTemplate({
    //     firstName,
    //     lastName,
    //     email: addressToSendEmail ?? '',
    //     verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
    // })

    const resendVerificationEmail = buildWelcomeEmailTemplate({
        firstName,
        lastName,
        email: addressToSendEmail ?? '',
        verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
        groupType: '',
        groupName: '',
    })

    return sendEmailUsingResend(
        [addressToSendEmail ?? ''],
        'Please verify your email',
        resendVerificationEmail,
    )
}

export const validateIdentifier = (identifier: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/

    if (emailRegex.test(identifier))
        return { isValid: true, type: 'email' as const }
    if (phoneRegex.test(identifier))
        return { isValid: true, type: 'phone' as const }
    return {
        isValid: false,
        error: 'Invalid format. Use email (user@example.com) or Bangladeshi phone (01XXXXXXXXX)',
    }
}

export async function usernameExists(username: string) {
    const normalizedUsername = username.trim().toLowerCase()
    const result = await db
        .select()
        .from(usersTable)
        .where(sql`lower(username) = ${normalizedUsername}`)
        .limit(1)
    return result.length > 0
}

export async function updateUserPassword(
    userId: string,
    hashedPassword: string,
): Promise<void> {
    await db
        .update(usersTable)
        .set({ password: hashedPassword })
        .where(eq(usersTable.id, userId))
}

export const VERIFICATION_COUNTDOWN_MS = 3 * 60 * 1000

export const validateCountdown = (
    lastRequestTime: Date | null | undefined,
    countdownMs: number = VERIFICATION_COUNTDOWN_MS,
): CountdownValidationResult => {
    if (!lastRequestTime) {
        return { allowed: true }
    }

    const lastRequestTimeMs = new Date(lastRequestTime).getTime()
    const currentTime = Date.now()
    const timeSinceLastRequest = currentTime - lastRequestTimeMs

    if (timeSinceLastRequest < countdownMs) {
        const remainingTimeMinutes = Math.ceil(
            (countdownMs - timeSinceLastRequest) / 1000 / 60,
        )

        return {
            allowed: false,
            remainingTime: remainingTimeMinutes,
            message: `Please wait ${remainingTimeMinutes} minute(s) before requesting another  code`,
        }
    }

    return { allowed: true }
}
export function isExpiringInDays(exp: number, days: number): boolean {
    const now = DateUtil.date()
    return exp > DateUtil.addDays(now, days).getTime()
}

export function buildAdminPayload(admin: SelectAdmin) {
    return {
        id: admin.id,
        firstName: admin.name || '',
        lastName: '',
        email: admin.email,
        phone: null,
        username: admin.email,
        status: admin.status,
    }
}

export async function buildUserContext(userId: string, groupId: string) {
    const user = await findUserById(userId)
    const group = await findGroupById(groupId)
    const role =
        user && group ? await getRoleByUserAndGroup(user.id, group.id) : null

    return { user, group, role } as {
        user?: User
        group?: Group
        role?: SelectRole
    }
}

export async function createUser(
    userData: z.infer<typeof CreateUserSchema>,
): Promise<z.infer<typeof UserCreateResult>> {
    const validatedData = CreateUserSchema.parse(userData)
    const hashedPassword = await argon2.hash(validatedData.password)

    const result = await db
        .insert(usersTable)
        .values({
            ...validatedData,
            verified: true, //! TODO : remove it when sms service is fixed
            password: hashedPassword,
            email: validatedData.email ?? null,
            phone: validatedData.phone ?? null,
        })
        .returning() // returns array of inserted rows

    const user = Array.isArray(result) ? result[0] : result.rows?.[0]

    if (!user?.id) throw new Error('Failed to create user: missing id')

    return UserCreateResult.parse(user) // single object
}

type Organization = {
    groupType: 'client' | 'vendor'
    name?: string
}
export async function createUserOrganization(
    user: z.infer<typeof UserCreateResult>,
    organization: Organization,
) {
    const organizationSuffix = random(10000, 99999).toString()
    const organizationName = organization.name
        ? `${organization.name}`
        : `${user.firstName} ${user.lastName}'s Organization-${organizationSuffix}`

    const [group] = await createGroup({
        name: organizationName,
        ownerId: user.id,
        type: organization.groupType,
        verified: true,
        status: 'active',
    })

    return { group, organizationName }
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
