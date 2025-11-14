import { and, count, eq, getTableColumns, or } from 'drizzle-orm'
import { uniq } from 'es-toolkit'
import { db } from '../../db/db'
import { rolesTable } from '../../db/schema/roles.table'
import { InsertRole } from './role.schema'

function normalizePermissions(permissions: string[]): string {
    return uniq(permissions.map((p) => p.trim().toLowerCase()).sort()).join(',')
}

export async function findRoleById(id: string) {
    return db.select().from(rolesTable).where(eq(rolesTable.id, id))
}

export async function createRole(
    groupId: string,
    name: string,
    description: string,
    permissions: string[],
) {
    const [role] = await db
        .insert(rolesTable)
        .values({
            name: name,
            description: description,
            groupId: groupId,
            permissions: normalizePermissions(permissions),
        })
        .returning()

    return role
}

export async function updateRole(roleId: string, data: Partial<InsertRole>) {
    const role = await findRoleById(roleId)
    if (!role || role.length === 0) {
        throw new Error('Role not found')
    }

    const updateData: Partial<InsertRole> = {
        ...data,
        permissions: data.permissions
            ? normalizePermissions(data.permissions.split(','))
            : undefined,
    }

    const [updatedRole] = await db
        .update(rolesTable)
        .set(updateData)
        .where(eq(rolesTable.id, roleId))
        .returning()

    return updatedRole
}

export const findRoles = async (groupId: string) => {
    const roles = await db
        .select({
            ...getTableColumns(rolesTable),
        })
        .from(rolesTable)
        .where(or(and(eq(rolesTable.groupId, groupId))))

    return roles
}

export async function countRolesByGroupId(groupId: string): Promise<number> {
    const [result] = await db
        .select({ count: count(rolesTable.id) })
        .from(rolesTable)
        .where(eq(rolesTable.groupId, groupId))

    return result.count || 0
}

export const getRolePermissions = async (
    roleId: string,
): Promise<string[] | null> => {
    const [role] = await db
        .select({ permissions: rolesTable.permissions })
        .from(rolesTable)
        .where(eq(rolesTable.id, roleId))
        .limit(1)
    return (role?.permissions?.split(',') ?? []).map((c) =>
        c.trim().toLowerCase(),
    )
}
