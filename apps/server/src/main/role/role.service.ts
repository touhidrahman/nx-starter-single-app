import { and, count, eq, getTableColumns, or } from 'drizzle-orm'
import { isEqual } from 'es-toolkit'
import { db } from '../../core/db/db'
import { rolesTable } from '../../core/db/schema/roles.table'
import { getDefaultClaims } from '../claim/claim.service'
import { InsertRole } from './role.schema'

export async function findRoleById(id: string) {
    return db.select().from(rolesTable).where(eq(rolesTable.id, id))
}

export async function createRole(
    groupId: string,
    name: string,
    description: string,
    groupType: 'vendor' | 'client',
    claims: string[],
    isSystemRole = false,
) {
    const [role] = await db
        .insert(rolesTable)
        .values({
            name: name,
            description: description,
            groupId: groupId,
            groupType: groupType,
            claims: claims.sort(),
            isSystemRole,
        })
        .returning()

    return role
}

export async function upsertSystemRole(
    systemRoleName: string,
    groupType: 'vendor' | 'client',
    description: string,
) {
    const [role] = await findSystemRoleByName(systemRoleName)

    const claims = getDefaultClaims(systemRoleName, groupType)

    if (!role) {
        const [newRole] = await db
            .insert(rolesTable)
            .values({
                name: systemRoleName,
                description,
                claims: claims,
                isSystemRole: true,
                groupId: null, // system roles will not have any group id,
                groupType,
            })
            .returning()
        return newRole
    }

    if (!isEqual(role.claims, claims)) {
        const [updatedRole] = await db
            .update(rolesTable)
            .set({ claims: claims })
            .where(eq(rolesTable.id, role.id))
            .returning()

        return updatedRole
    }

    return role
}

export async function updateRole(
    roleId: string,
    data: Partial<InsertRole>,
    allowUpdateSystemRoles: boolean,
) {
    const role = await findRoleById(roleId)
    if (!role || role.length === 0) {
        throw new Error('Role not found')
    }
    if (role[0].isSystemRole && !allowUpdateSystemRoles) {
        throw new Error('Cannot update a system role without permission')
    }

    const updateData: Partial<InsertRole> = { ...data }
    if (!allowUpdateSystemRoles) {
        // Prevent updating system role fields if not allowed
        delete updateData.isSystemRole
    }
    const [updatedRole] = await db
        .update(rolesTable)
        .set(updateData)
        .where(eq(rolesTable.id, roleId))
        .returning()

    return updatedRole
}

export async function findSystemRoleByName(systemRoleName: string) {
    return db
        .select()
        .from(rolesTable)
        .where(
            and(
                eq(rolesTable.name, systemRoleName),
                eq(rolesTable.isSystemRole, true),
            ),
        )
        .limit(1)
}

/** Include system roles with the result */
export const findRoles = async (params: {
    groupId: string
    groupType: 'client' | 'vendor'
}) => {
    const { groupId, groupType } = params

    const roles = await db
        .select({
            ...getTableColumns(rolesTable),
        })
        .from(rolesTable)
        .where(
            or(
                and(
                    eq(rolesTable.groupId, groupId),
                    eq(rolesTable.groupType, groupType),
                ),
                and(
                    eq(rolesTable.isSystemRole, true),
                    eq(rolesTable.groupType, groupType),
                ),
            ),
        )

    return roles
}

export async function countRolesByGroupId(groupId: string): Promise<number> {
    const [result] = await db
        .select({ count: count(rolesTable.id) })
        .from(rolesTable)
        .where(eq(rolesTable.groupId, groupId))

    return result.count || 0
}

export const fetchRoleClaims = async (
    roleId: string,
): Promise<string[] | null> => {
    const [role] = await db
        .select({ claims: rolesTable.claims })
        .from(rolesTable)
        .where(eq(rolesTable.id, roleId))
        .limit(1)
    return (role?.claims ?? []).map((c) => c.trim().toLowerCase())
}
