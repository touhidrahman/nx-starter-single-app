import {
    and,
    count,
    eq,
    getTableColumns,
    ilike,
    inArray,
    SQL,
    sql,
} from 'drizzle-orm'
import { db } from '../../core/db/db'
import {
    groupsTable,
    invitesTable,
    rolesTable,
    usersGroupsTable,
    usersTable,
} from '../../core/db/schema'
import { GroupDto, groupStatus } from './group.schema'

// Retrieve the default group for a specific authenticated user.
export const getDefaultGroup = async (userId: string) => {
    const results = await db
        .select()
        .from(groupsTable)
        .innerJoin(usersTable, eq(groupsTable.id, usersTable.defaultGroupId))
        .where(and(eq(usersTable.id, userId)))
        .limit(1)

    return results?.[0] ?? null
}

// Find all groups with pagination
export async function findAllGroups(page = 1, size = 10) {
    const offset = (page - 1) * size
    const groups = await db
        .select()
        .from(groupsTable)
        .limit(size)
        .offset(offset)

    return groups
}

export const findManyGroups = async (params: {
    search?: string
    status?: 'active' | 'inactive' | 'pending'
    type?: 'client' | 'vendor'
    page: number
    size: number
    orderBy: string
}): Promise<(typeof groupsTable.$inferSelect)[]> => {
    const { page, size, orderBy, ...filterParams } = params
    const offset = (page - 1) * size

    const whereClause = getGroupsWhereConditions(filterParams)

    const query = db
        .select({
            ...getTableColumns(groupsTable),
            ownerName:
                sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`.as(
                    'ownerName',
                ),
            ownerUsername: usersTable.username,
        })
        .from(groupsTable)
        .leftJoin(usersTable, eq(groupsTable.ownerId, usersTable.id))
        .limit(size)
        .offset(offset)

    if (whereClause) query.where(whereClause)

    // const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
    const direction =
        orderBy && typeof orderBy === 'string'
            ? orderBy.toLowerCase() === 'desc'
                ? 'DESC'
                : 'ASC'
            : 'ASC'
    query.orderBy(sql`${groupsTable.createdAt} ${sql.raw(direction)}`)

    return await query
}

export const getGroupsWhereConditions = (params: {
    search?: string
    status?: 'active' | 'inactive' | 'pending'
    type?: 'client' | 'vendor'
}): SQL<unknown> | undefined => {
    const { search, status, type } = params
    const conditions: SQL<unknown>[] = []

    if (status) conditions.push(eq(groupsTable.status, status))
    if (type) conditions.push(eq(groupsTable.type, type))
    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(
            ${ilike(groupsTable.name, searchTerm)} OR
            ${ilike(groupsTable.email, searchTerm)} OR
            ${ilike(groupsTable.phone, searchTerm)}
            )`,
        )
    }

    return conditions.length > 0 ? and(...conditions) : undefined
}

export async function countGroups() {
    const result = await db.select({ count: count() }).from(groupsTable)

    return result?.[0]?.count || 0
}

export async function findGroupById(id: string) {
    const result = await db.query.groupsTable.findFirst({
        where: eq(groupsTable.id, id),
    })
    return result
}

// Check if a user is the owner of a group.
export const isOwner = async (userId: string, groupId: string) => {
    const results = await db
        .select({ count: count() })
        .from(groupsTable)
        .where(
            and(eq(groupsTable.id, groupId), eq(groupsTable.ownerId, userId)),
        )

    return results?.[0].count === 1
}

// Check if a user is a participant in a group.
export const isParticipant = async (userId: string, groupId: string) => {
    const results = await db
        .select({ count: count() })
        .from(usersGroupsTable)
        .where(
            and(
                eq(usersGroupsTable.groupId, groupId),
                eq(usersGroupsTable.userId, userId),
            ),
        )

    return results?.[0].count === 1
}

// Insert a new group.
export const createGroup = async (group: GroupDto): Promise<GroupDto> => {
    const newGroup = db.insert(groupsTable).values(group).returning()
    return newGroup
}

// Update an existing group by ID.
export const updateGroup = async (id: string, group: Partial<GroupDto>) =>
    db.update(groupsTable).set(group).where(eq(groupsTable.id, id)).returning()

export const updateGroupStatus = async (id: string, data: groupStatus) =>
    db
        .update(groupsTable)
        .set({ status: data.status })
        .where(eq(groupsTable.id, id))
        .returning()

export const deleteGroup = async (id: string) => {
    const result = await db
        .delete(usersGroupsTable)
        .where(eq(usersGroupsTable.groupId, id))
        .returning()
    return result
}
export const deleteGroupWithOwner = async (id: string) => {
    await db.delete(usersGroupsTable).where(eq(usersGroupsTable.groupId, id))

    // delete the owner user only, not members
    const group = await db
        .select()
        .from(groupsTable)
        .where(eq(groupsTable.id, id))
        .limit(1)
    if (group[0]?.ownerId) {
        await db.delete(usersTable).where(eq(usersTable.id, group[0]?.ownerId))
    }

    return db.delete(groupsTable).where(eq(groupsTable.id, id)).returning()
}

// Verify a group by setting its verified status to true.
export const verifyGroup = async (id: string) =>
    db
        .update(groupsTable)
        .set({ verified: true, verifiedOn: new Date() })
        .where(eq(groupsTable.id, id))
        .returning()

// Bulk delete multiple groups by their IDs.
export const deleteManyGroups = async (ids: string[]) =>
    db.delete(groupsTable).where(inArray(groupsTable.id, ids)).returning()

// Check if a group exists by ID
export async function groupExists(id: string) {
    const groupCount = await db
        .select({ value: count() })
        .from(groupsTable)
        .where(eq(groupsTable.id, id))

    return groupCount?.[0]?.value === 1
}

export async function setDefaultGroup(userId: string, groupId: string) {
    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1)

    if (user?.length === 0) {
        throw new Error('User not found')
    }
    const currentUser = user[0]

    if (currentUser.defaultGroupId) {
        return
    }
    await db
        .update(usersTable)
        .set({ defaultGroupId: groupId })
        .where(eq(usersTable.id, userId))
}

export async function findOwnedGroupByType(
    userId: string,
    type: 'client' | 'vendor',
) {
    const [group] = await db
        .select()
        .from(groupsTable)
        .where(and(eq(groupsTable.ownerId, userId), eq(groupsTable.type, type)))
        .limit(1)
    return group
}

export async function addUserToGroup(
    userId: string,
    groupId: string,
    roleId: string,
) {
    const [userGroup] = await db
        .insert(usersGroupsTable)
        .values({
            userId,
            groupId,
            roleId,
        })
        .returning()

    return userGroup
}

// Adjust the import based on your schema file

export const getAllGroupsExcept = async (params: {
    search: string
    page: number
    size: number
    orderBy?: string
    status: 'active' | 'inactive' | 'pending'
    type: 'client' | 'vendor'
    groupId?: string // Make it optional
}) => {
    const { status, type, search, page, size, orderBy, groupId } = params

    const conditions: SQL<unknown>[] = []

    if (status) {
        conditions.push(eq(groupsTable.status, status))
    }
    if (type) {
        conditions.push(eq(groupsTable.type, type))
    }

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(groupsTable.name, searchTerm)} OR ${ilike(groupsTable.email, searchTerm)})`,
        )
    }

    // Exclude the specified groupId if provided
    if (groupId) {
        conditions.push(sql`${groupsTable.id} != ${groupId}`) // Use sql template for NOT EQUAL condition
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(groupsTable),
        })
        .from(groupsTable)
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(sql`${groupsTable.createdAt} ${sql.raw(direction)}`)
    }

    const results = await query

    const totalCountQuery = db
        .select({
            count: sql`count(*)`.as<number>(),
        })
        .from(groupsTable)

    if (whereClause) {
        totalCountQuery.where(whereClause)
    }

    const totalCountResult = await totalCountQuery
    const totalCount = totalCountResult[0]?.count || 0

    return {
        data: results,
        meta: {
            page,
            size,
            totalCount,
            totalPages: Math.ceil(totalCount / size),
        },
    }
}

// update subscriptionId
export const updateSubscriptionId = async (
    groupId: string,
    subscriptionId: string,
) =>
    db
        .update(groupsTable)
        .set({ subscriptionId })
        .where(eq(groupsTable.id, groupId))
        .returning()

export const removeSubscriptionIdFromGroup = async (groupId: string) =>
    db
        .update(groupsTable)
        .set({ subscriptionId: null })
        .where(eq(groupsTable.id, groupId))
        .returning()

export const getAllGroupsByUserId = async (userId: string) => {
    const groups = await db
        .select({
            ...getTableColumns(groupsTable),
        })
        .from(groupsTable)
        .innerJoin(
            usersGroupsTable,
            eq(groupsTable.id, usersGroupsTable.groupId),
        )
        .where(eq(usersGroupsTable.userId, userId))

    return groups
}

export const findMembership = async (groupId: string, userId: string) => {
    const result = await db
        .select()
        .from(usersGroupsTable)
        .where(
            and(
                eq(usersGroupsTable.groupId, groupId),
                eq(usersGroupsTable.userId, userId),
            ),
        )
        .limit(1)
    return result[0]
}

export const removeUserFromGroup = async (userId: string, groupId: string) => {
    return db
        .delete(usersGroupsTable)
        .where(
            and(
                eq(usersGroupsTable.userId, userId),
                eq(usersGroupsTable.groupId, groupId),
            ),
        )
        .execute()
}

export const removeAllGroupMembers = async (groupId: string) => {
    await db
        .delete(usersGroupsTable)
        .where(eq(usersGroupsTable.groupId, groupId))
}

export const removeGroupOwner = async (groupId: string) => {
    await db
        .update(groupsTable)
        .set({ ownerId: null })
        .where(eq(groupsTable.id, groupId))
}

export const resetDefaultGroupId = async (groupId: string) => {
    const results = await db
        .update(usersTable)
        .set({ defaultGroupId: null })
        .where(eq(usersTable.defaultGroupId, groupId))
    return results
}

export const deleteAllGroupInvites = async (groupId: string) => {
    await db.delete(invitesTable).where(eq(invitesTable.groupId, groupId))
}

export const deleteAllGroupRoles = async (groupId: string) => {
    await db.delete(rolesTable).where(eq(rolesTable.groupId, groupId))
}

export async function isUserMemberVendorGroup(
    userId: string,
    groupId: string,
): Promise<boolean> {
    const membership = await db
        .select({ userId: usersGroupsTable.userId })
        .from(usersGroupsTable)
        .where(
            and(
                eq(usersGroupsTable.userId, userId),
                eq(usersGroupsTable.groupId, groupId),
            ),
        )
        .limit(1)

    return membership.length > 0
}
