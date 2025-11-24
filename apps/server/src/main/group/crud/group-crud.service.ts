import { and, eq } from 'drizzle-orm'
import { FORBIDDEN, NOT_FOUND } from 'stoker/http-status-codes'
import { db } from '../../../db/db'
import { groupsTable, membershipsTable } from '../../../db/schema'
import { UserCrudService } from '../../user/crud/user-crud.service'
import { GroupCoreService } from '../core/group-core.service'

export class GroupCrudService extends GroupCoreService {
    static async delete(id: string): Promise<void> {
        const group = await GroupCrudService.findById(id)
        if (!group) {
            throw new Error('Group not found')
        }
        await GroupCrudService.removeGroupOwner(id)
        await GroupCrudService.removeAllGroupMembers(id)
        group?.creatorId && (await UserCrudService.delete(group.creatorId))
        await db.delete(groupsTable).where(eq(groupsTable.id, id)).execute()
    }

    static async removeGroupOwner(id: string): Promise<void> {
        await db
            .update(groupsTable)
            .set({ creatorId: null })
            .where(eq(groupsTable.id, id))
    }

    static async removeAllGroupMembers(id: string): Promise<void> {
        await db
            .delete(membershipsTable)
            .where(eq(membershipsTable.groupId, id))
    }

    static async removeUserFromGroup(
        userId: string,
        groupId: string,
    ): Promise<void> {
        const group = await GroupCrudService.findById(groupId)
        if (!group) {
            throw new Error('Group not found', { cause: NOT_FOUND })
        }
        if (group.creatorId === userId) {
            throw new Error('Cannot remove group owner from the group', {
                cause: FORBIDDEN,
            })
        }
        await db
            .delete(membershipsTable)
            .where(
                and(
                    eq(membershipsTable.userId, userId),
                    eq(membershipsTable.groupId, groupId),
                ),
            )
    }
}
