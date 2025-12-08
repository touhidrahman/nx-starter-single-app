import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/db'
import { groupsTable, membershipsTable, rolesTable, usersTable } from '../../../db/schema'
import { SelectGroup } from '../core/group-core.model'
import { GroupCrudService } from '../crud/group-crud.service'
import { GroupMember, Membership } from './group-custom.model'

export class GroupCustomService extends GroupCrudService {
    static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
        const res = await db
            .select({
                user: usersTable,
                membership: membershipsTable,
                role: rolesTable,
            })
            .from(membershipsTable)
            .leftJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
            .leftJoin(rolesTable, eq(membershipsTable.roleId, rolesTable.id))
            .where(and(eq(membershipsTable.groupId, groupId)))

        if (!res) {
            return [] as GroupMember[]
        }

        return res.map((row) => {
            return {
                ...row.user,
                role: row.role,
            }
        }) as GroupMember[]
    }

    static async getGroupMember(groupId: string, userId: string): Promise<GroupMember | null> {
        const res = await db
            .select({
                user: usersTable,
                membership: membershipsTable,
                role: rolesTable,
            })
            .from(membershipsTable)
            .leftJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
            .leftJoin(rolesTable, eq(membershipsTable.roleId, rolesTable.id))
            .where(and(eq(membershipsTable.groupId, groupId), eq(membershipsTable.userId, userId)))

        if (!res || res.length === 0) {
            return null
        }

        const row = res[0]
        return {
            ...row.user,
            role: row.role,
        } as GroupMember
    }

    static async addGroupMember({ groupId, userId, roleId }: Membership): Promise<Membership> {
        const [result] = await db
            .insert(membershipsTable)
            .values({ groupId, userId, roleId })
            .onConflictDoUpdate({
                target: [membershipsTable.groupId, membershipsTable.userId],
                set: { roleId },
            })
            .returning()

        return {
            ...result,
            roleId: result.roleId !== null ? result.roleId : roleId,
        }
    }

    static async addGroupMembers(
        groupId: string,
        memberships: { userId: string; roleId: string }[],
    ): Promise<void> {
        for (const { userId, roleId } of memberships) {
            await db
                .insert(membershipsTable)
                .values({ groupId, userId, roleId })
                .onConflictDoUpdate({
                    target: [membershipsTable.groupId, membershipsTable.userId],
                    set: { roleId },
                })
        }
    }

    static async removeGroupMembers(groupId: string, userIds: string[]): Promise<void> {
        for (const userId of userIds) {
            await db
                .delete(membershipsTable)
                .where(
                    and(eq(membershipsTable.groupId, groupId), eq(membershipsTable.userId, userId)),
                )
        }
    }

    static async findInvolvedGroups(
        userId: string,
    ): Promise<(SelectGroup & { membership: 'Owner' | 'Member' })[]> {
        const result = await db
            .select()
            .from(groupsTable)
            .innerJoin(membershipsTable, eq(groupsTable.id, membershipsTable.groupId))
            .where(eq(membershipsTable.userId, userId))

        return result.map(({ groups: group }) => ({
            ...group,
            membership: group.creatorId === userId ? 'Owner' : 'Member',
        }))
    }
}
