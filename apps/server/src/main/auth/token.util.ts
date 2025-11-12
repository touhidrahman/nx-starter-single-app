import { randomBytes } from 'node:crypto'
import { sign, verify } from 'hono/jwt'
import { SystemUserLevel } from '../../core/core.type'
import { addDuration, DateUnit, DateUtil } from '../../core/utils/date.util'
import env from '../../env'
import { InsertGroup, SelectGroup } from '../group/group.schema'
import { TokenCreateUserData } from './auth.schema'

const dateUtil = DateUtil

export const ACCESS_TOKEN_LIFE =
    env.NODE_ENV !== 'production' ? 24 * 60 * 60 : 15 * 60
export const REFRESH_TOKEN_LIFE = 7 * 24 * 60 * 60 // 7 days

export type AccessTokenPayload = {
    firstName: string
    lastName: string
    username: string
    level: SystemUserLevel
    roleId: string
    groupId: string | ''
    sub: string // userId
    exp: number
}

export type RefreshTokenPayload = {
    sub: string
    exp: number
    groupId: string
    level?: SystemUserLevel
}

export type InvitationTokenPayload = {
    userEmail: string
    organizationId: string
    organizationName: string
    roleId: string
    invitationId: string
}

export async function createAccessToken(
    user: TokenCreateUserData,
    roleId?: string,
    group?: SelectGroup,
) {
    const tokenPayload: AccessTokenPayload = {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        username: user.username ?? '',
        level: SystemUserLevel.USER,
        roleId: roleId ?? '',
        groupId: group?.id ?? '',
        sub: user.id,
        exp: dateUtil.addSeconds(dateUtil.date(), ACCESS_TOKEN_LIFE).getTime(),
    }

    return await sign(tokenPayload, env.ACCESS_TOKEN_SECRET)
}

export async function createRefreshToken(userId: string, groupId?: string) {
    const tokenPayload: RefreshTokenPayload = {
        sub: userId,
        exp: dateUtil.addSeconds(dateUtil.date(), REFRESH_TOKEN_LIFE).getTime(),
        groupId: groupId ?? '',
    }
    return await sign(tokenPayload, env.REFRESH_TOKEN_SECRET)
}

export async function decodeRefreshToken(
    token: string,
): Promise<RefreshTokenPayload | null> {
    const { sub, exp, groupId, level } = await verify(
        token,
        env.REFRESH_TOKEN_SECRET,
    )
    if (exp && exp < dateUtil.date().getTime()) return null
    return {
        sub: sub as string,
        groupId: groupId as string,
        exp: exp as number,
        level: level as SystemUserLevel | undefined,
    }
}

export async function decodeVerificationToken(
    token: string,
): Promise<{ email?: string; userId: string; phone?: string } | null> {
    // const verificationToken = token.split('&')
    const { email, sub, exp, phone } = await verify(
        token,
        process.env.REFRESH_TOKEN_SECRET ?? '',
    )

    if (exp && exp < dateUtil.date().getTime()) return null
    return {
        email: email as string,
        userId: sub as string,
        phone: phone as string,
    }
}

export async function createVerificationToken(
    userId: string,
    duration: { value: number; unit: DateUnit },
    email?: string,
    phone?: string,
) {
    const random = randomBytes(64).toString('hex')
    const token = await sign(
        {
            sub: userId,
            email: email ?? null,
            phone: phone ?? null,
            exp: addDuration(duration.value, duration.unit).getTime(),
        },
        env.REFRESH_TOKEN_SECRET,
    )
    return `${token}`
}

export async function createAdminAccessToken(user: {
    name: string | null
    email: string
    id: string
}) {
    const tokenPayload = {
        name: user.name ?? '',
        email: user.email,
        level: SystemUserLevel.ADMIN,
        sub: user.id,
        exp:
            dateUtil.addSeconds(dateUtil.date(), ACCESS_TOKEN_LIFE).getTime() /
            1000,
    }

    return await sign(tokenPayload, env.ACCESS_TOKEN_SECRET)
}

export async function createAdminRefreshToken(user: { id: string }) {
    const tokenPayload = {
        sub: user.id,
        level: SystemUserLevel.ADMIN,
        exp: dateUtil.addDays(dateUtil.date(), 7).getTime(),
    }
    return await sign(tokenPayload, env.REFRESH_TOKEN_SECRET)
}

export const generateInvitationToken = async (
    inviteToken: InvitationTokenPayload,
) => {
    const tokenPayload = {
        ...inviteToken,
        exp: dateUtil.addDays(dateUtil.date(), 30).getTime(),
    }
    return await sign(tokenPayload, env.INVITE_TOKEN_SECRET_KEY)
}

export async function decodeInvitationToken(
    token: string,
): Promise<InvitationTokenPayload | null> {
    try {
        const decoded = await verify(token, env.INVITE_TOKEN_SECRET_KEY ?? '')
        if (
            typeof decoded !== 'object' ||
            !decoded.exp ||
            !decoded.userEmail ||
            !decoded.organizationId ||
            !decoded.roleId ||
            !decoded.invitationId
        ) {
            throw new Error('Invalid token payload')
        }

        if (decoded.exp < dateUtil.date().getTime()) {
            throw new Error('Token has expired')
        }

        return decoded as InvitationTokenPayload
    } catch (error) {
        return null
    }
}

export async function createGeneralToken(
    sub: string,
    expirationSeconds: number,
) {
    const tokenPayload = {
        sub,
        exp: dateUtil.addSeconds(dateUtil.date(), expirationSeconds).getTime(),
    }
    return await sign(tokenPayload, env.REFRESH_TOKEN_SECRET)
}

export async function decodeGeneralToken(
    token: string,
): Promise<{ sub: string; exp: number } | null> {
    try {
        const decoded = await verify(token, env.REFRESH_TOKEN_SECRET)
        if (typeof decoded !== 'object' || !decoded.sub || !decoded.exp) {
            throw new Error('Invalid token payload')
        }

        if (decoded.exp < dateUtil.date().getTime()) {
            throw new Error('Token has expired')
        }

        return decoded as { sub: string; exp: number }
    } catch (error) {
        return null
    }
}
