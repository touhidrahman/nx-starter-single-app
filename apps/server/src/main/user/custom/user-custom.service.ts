import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/db'
import { membershipsTable } from '../../../db/schema'
import { DateUtil } from '../../../utils/date.util'
import { CryptoService } from '../../auth/crypto.service'
import { createAccessToken2, createRefreshToken } from '../../auth/token.util'
import { SelectUser } from '../core/user-core.model'
import { UserCrudService } from '../crud/user-crud.service'
import { UserLoginResponse } from './user-custom.model'

export class UserCustomService extends UserCrudService {
    static async login(
        email: string,
        password: string,
    ): Promise<UserLoginResponse> {
        const user = await UserCustomService.findOne({ email })
        if (!user) {
            throw new Error('Invalid email or password')
        }

        const now = DateUtil.date()
        if (
            user.bannedAt &&
            DateUtil.isBefore(DateUtil.toJsDate(user.bannedAt), now)
        ) {
            throw new Error(
                'Your account has been locked. Please contact support.',
            )
        }

        const isPasswordValid = await CryptoService.verifyPassword(
            password,
            user.password,
        )
        if (!isPasswordValid) {
            throw new Error('Invalid email or password')
        }

        let accessToken = ''
        let refreshToken = ''

        if (user.defaultGroupId) {
            const membership = await db.query.membershipsTable.findFirst({
                where: and(
                    eq(membershipsTable.userId, user.id),
                    eq(membershipsTable.groupId, user.defaultGroupId),
                ),
            })

            if (membership) {
                accessToken = await createAccessToken2({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    roleId: membership?.roleId ?? undefined,
                    groupId: membership?.groupId,
                })
                refreshToken = await createRefreshToken(
                    user.id,
                    membership.groupId,
                )
            } else {
                const res = await UserCustomService.getTokens(user)
                accessToken = res.accessToken
                refreshToken = res.refreshToken
            }
        } else {
            const tokens = await UserCustomService.getTokens(user)
            accessToken = tokens.accessToken
            refreshToken = tokens.refreshToken
        }

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            lastLogin: new Date().toISOString(),
            user: { ...user, password: '' },
        }
    }

    private static async getTokens(
        user: SelectUser,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        let roleId = ''
        let groupId = ''

        const memberships = await db.query.membershipsTable.findMany({
            where: eq(membershipsTable.userId, user.id),
        })

        // set default group id if not set to the first group in memberships
        if (memberships.length > 0) {
            roleId = memberships[0]?.roleId ?? ''
            groupId = memberships[0]?.groupId ?? ''
            await UserCustomService.update(user.id, {
                defaultGroupId: groupId,
            })
        }

        const accessToken = await createAccessToken2({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roleId,
            groupId,
        })
        const refreshToken = await createRefreshToken(user.id, groupId)
        return { accessToken, refreshToken }
    }
}
