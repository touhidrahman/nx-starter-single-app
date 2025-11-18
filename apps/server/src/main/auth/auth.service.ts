import { and, eq } from 'drizzle-orm'
import { db } from '../../db/db'
import { groupsTable, membershipsTable } from '../../db/schema'
import { DateUtil } from '../../utils/date.util'
import { SelectGroup } from '../group/group.schema'
import { SelectRole } from '../role/role.schema'
import { SelectUser } from '../user/core/user-core.model'
import { UserCrudService } from '../user/crud/user-crud.service'
import { passwordRemoved } from '../user/user.util'
import { UserLoginResponse } from './auth.model'
import { CryptoService } from './crypto.service'
import { createAccessToken2, createRefreshToken } from './token.util'

export class AuthService extends UserCrudService {
    static async login(
        emailOrUsername: string,
        password: string,
    ): Promise<UserLoginResponse> {
        const user = await AuthService.findByEmailOrUsername(emailOrUsername)
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

        let roleId = ''
        let groupId = ''

        if (user.defaultGroupId) {
            const membership = await db.query.membershipsTable.findFirst({
                where: and(
                    eq(membershipsTable.userId, user.id),
                    eq(membershipsTable.groupId, user.defaultGroupId),
                ),
            })

            if (membership) {
                roleId = membership.roleId ?? ''
                groupId = membership.groupId
            } else {
                const res =
                    await AuthService.getFirstMembershipRoleAndGroup(user)
                roleId = res.roleId
                groupId = res.groupId
            }
        } else {
            const res = await AuthService.getFirstMembershipRoleAndGroup(user)
            roleId = res.roleId
            groupId = res.groupId
        }

        const role = await db.query.membershipsTable.findFirst({
            with: { role: true },
            where: eq(membershipsTable.roleId, roleId),
        })
        const group = await db.query.groupsTable.findFirst({
            where: eq(groupsTable.id, groupId),
        })

        return AuthService.getUserLoginResponse(
            user,
            group ?? null,
            role?.role ?? null,
        )
    }

    static async getUserLoginResponseByUserIdAndGroupId(
        userId: string,
        groupId: string,
    ): Promise<UserLoginResponse | null> {
        const membership = await db.query.membershipsTable.findFirst({
            where: and(
                eq(membershipsTable.userId, userId),
                eq(membershipsTable.groupId, groupId),
            ),
            with: { role: true, group: true, user: true },
        })
        if (membership) {
            return AuthService.getUserLoginResponse(
                membership.user,
                membership.group,
                membership.role,
            )
        }
        return null
    }

    static async getUserLoginResponseByIds(
        userId: string,
        groupId: string,
        roleId: string,
    ): Promise<UserLoginResponse | null> {
        const membership = await db.query.membershipsTable.findFirst({
            where: and(
                eq(membershipsTable.userId, userId),
                eq(membershipsTable.groupId, groupId),
                eq(membershipsTable.roleId, roleId),
            ),
            with: { role: true, group: true, user: true },
        })

        if (membership) {
            return AuthService.getUserLoginResponse(
                membership.user,
                membership.group,
                membership.role,
            )
        }
        return null
    }

    static async getUserLoginResponse(
        user: SelectUser,
        group: SelectGroup | null,
        role: SelectRole | null,
    ): Promise<UserLoginResponse> {
        const accessToken = await createAccessToken2({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roleId: role?.id ?? '',
            groupId: group?.id,
        })
        const refreshToken = await createRefreshToken(user.id, group?.id)

        return {
            accessToken,
            refreshToken,
            lastLogin: new Date(),
            user: passwordRemoved(user),
            role,
            group,
        }
    }

    private static async getFirstMembershipRoleAndGroup(
        user: SelectUser,
    ): Promise<{ roleId: string; groupId: string }> {
        let roleId = ''
        let groupId = ''

        const memberships = await db.query.membershipsTable.findMany({
            where: eq(membershipsTable.userId, user.id),
        })

        // set default group id if not set to the first group in memberships
        if (memberships.length > 0) {
            roleId = memberships[0]?.roleId ?? ''
            groupId = memberships[0]?.groupId ?? ''
            await AuthService.update(user.id, {
                defaultGroupId: groupId,
            })
        }

        return { roleId, groupId }
    }
}
