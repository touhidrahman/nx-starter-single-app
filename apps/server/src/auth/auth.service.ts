import * as argon2 from 'argon2'
import { and, count, eq, or, sql } from 'drizzle-orm'
import { random } from 'radash'
import { SelectAdmin } from '../admin/admin.schema'
import { db } from '../db/db'
import { lower } from '../db/orm.util'
import { membershipsTable, rolesTable, usersTable } from '../db/schema'
import { sendEmailUsingResend } from '../email/email.service'
import env from '../env'
import { buildAdminNotificationTemplate } from '../main/email/templates/group-status-update-notification'
import { buildSuccessEmailTemplate } from '../main/email/templates/success-template'
import { buildWelcomeEmailTemplate } from '../main/email/templates/welcome'
import { SelectGroup } from '../main/group/group.schema'
import { createGroup, findGroupById } from '../main/group/group.service'
import { SelectRole } from '../main/role/role.schema'
import { DateUtil } from '../utils/date.util'
import {
    CountdownValidationResult,
    CreateUserSchema,
    InsertUser,
    SelectUser,
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

export async function getRoleByUserAndGroup(
    userId: string,
    groupId: string,
): Promise<SelectRole | null> {
    const [userGroupRelation] = await db
        .select({
            roleId: membershipsTable.roleId,
        })
        .from(membershipsTable)
        .where(
            and(
                eq(membershipsTable.groupId, groupId),
                eq(membershipsTable.userId, userId),
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

export async function findUserById(userId: string) {
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)
    return user
}

export async function addUserToGroup(
    userId: string,
    groupId: string,
    roleId: string,
) {
    const [userGroup] = await db
        .insert(membershipsTable)
        .values({ groupId, userId, roleId })
        .returning()

    return userGroup
}

export async function sendProfileCreatedEmail(
    user: SelectUser,
    group: SelectGroup,
) {
    const createProfileSuccessTpl = buildSuccessEmailTemplate({
        recipientName: `${user.firstName} ${user.lastName}`,
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

export async function sendUpdateStatusEmailToAdmin(
    user: SelectUser,
    group: SelectGroup,
    adminEmails: string[],
) {
    const adminNotificationTpl = buildAdminNotificationTemplate({
        groupId: group.id ?? '',
        groupName: group.name ?? '',
        creatorName: `${user.firstName} ${user.lastName}`,
        creatorEmail: user.email ?? user.phone ?? '',
        url: `${env.FRONTEND_URL}/admin`,
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

export const verifyUser = async (userId: string) => {
    const [user] = await db
        .update(usersTable)
        .set({
            verifiedAt: new Date(),
        })
        .where(and(eq(usersTable.id, userId)))
        .returning()
    return user
}

export async function findUserByUsernameEmailPhone(
    phoneEmailOrUsername: string,
) {
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

export async function findUser(username: string) {
    const results = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1)
    return results?.[0] ?? null
}

export async function sendVerificationEmail(
    email: string,
    firstName: string,
    lastName: string,
    userId: string,
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
    }

    const addressToSendEmail =
        env.NODE_ENV === 'production' ? email : env.EMAIL_TEST_EMAIL

    const welcomeEmail = buildWelcomeEmailTemplate({
        firstName,
        lastName,
        email: addressToSendEmail ?? '',
        verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
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
    }

    const addressToSendEmail =
        env.NODE_ENV !== 'production' ? env.EMAIL_TEST_EMAIL : email

    const resendVerificationEmail = buildWelcomeEmailTemplate({
        firstName,
        lastName,
        email: addressToSendEmail ?? '',
        verificationUrl: `${env.FRONTEND_URL}/account-verify/${token}`,
        groupName: '',
    })

    return sendEmailUsingResend(
        [addressToSendEmail ?? ''],
        'Please verify your email',
        resendVerificationEmail,
    )
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
    }
}

export async function buildUserContext(userId: string, groupId: string) {
    const user = await findUserById(userId)
    const group = await findGroupById(groupId)
    const role =
        user && group?.id
            ? await getRoleByUserAndGroup(user.id, group.id)
            : null

    return { user, group, role } as {
        user?: SelectUser
        group?: SelectGroup
        role?: SelectRole
    }
}

export async function createUser(userData: InsertUser): Promise<SelectUser> {
    const validatedData = CreateUserSchema.parse(userData)
    const hashedPassword = await argon2.hash(validatedData.password)

    const result = await db
        .insert(usersTable)
        .values({
            ...validatedData,
            password: hashedPassword,
            email: validatedData.email ?? null,
            phone: validatedData.phone ?? null,
        })
        .returning() // returns array of inserted rows

    const user = Array.isArray(result) ? result[0] : result

    if (!user?.id) throw new Error('Failed to create user: missing id')

    return { ...user, password: 'REDACTED' }
}

export async function createUserOrganization(
    user: InsertUser,
    organization: string,
) {
    const organizationSuffix = random(10000, 99999).toString()
    const organizationName = organization
        ? `${organization}`
        : `${user.firstName} ${user.lastName}'s Organization-${organizationSuffix}`

    const [group] = await createGroup({
        name: organizationName,
        creatorId: user.id,
    })

    return { group, organizationName }
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
