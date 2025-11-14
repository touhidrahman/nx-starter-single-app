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
import { db } from '../../db/db'
import {
    groupsTable,
    invitesTable,
    membershipsTable,
    rolesTable,
    usersTable,
} from '../../db/schema'
import { InsertGroup, SelectGroup } from './group.schema'

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
        .leftJoin(usersTable, eq(groupsTable.creatorId, usersTable.id))
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
}): SQL<unknown> | undefined => {
    const { search } = params
    const conditions: SQL<unknown>[] = []

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

export async function findGroupById(
    id: string,
): Promise<SelectGroup | undefined> {
    return db.query.groupsTable.findFirst({
        where: eq(groupsTable.id, id),
    })
}

// Check if a user is the owner of a group.
export const isOwner = async (userId: string, groupId: string) => {
    const results = await db
        .select({ count: count() })
        .from(groupsTable)
        .where(
            and(eq(groupsTable.id, groupId), eq(groupsTable.creatorId, userId)),
        )

    return results?.[0].count === 1
}

// Check if a user is a participant in a group.
export const isParticipant = async (userId: string, groupId: string) => {
    const results = await db
        .select({ count: count() })
        .from(membershipsTable)
        .where(
            and(
                eq(membershipsTable.groupId, groupId),
                eq(membershipsTable.userId, userId),
            ),
        )

    return results?.[0].count === 1
}

export async function createGroup(group: InsertGroup): Promise<SelectGroup[]> {
    return db.insert(groupsTable).values(group).returning()
}

export const updateGroup = async (id: string, group: Partial<InsertGroup>) =>
    db.update(groupsTable).set(group).where(eq(groupsTable.id, id)).returning()

export const deleteGroup = async (id: string) => {
    const result = await db
        .delete(membershipsTable)
        .where(eq(membershipsTable.groupId, id))
        .returning()
    return result
}
export const deleteGroupWithOwner = async (id: string) => {
    await db.delete(membershipsTable).where(eq(membershipsTable.groupId, id))

    // delete the owner user only, not members
    const group = await db
        .select()
        .from(groupsTable)
        .where(eq(groupsTable.id, id))
        .limit(1)
    if (group[0]?.creatorId) {
        await db
            .delete(usersTable)
            .where(eq(usersTable.id, group[0]?.creatorId))
    }

    return db.delete(groupsTable).where(eq(groupsTable.id, id)).returning()
}

export const deleteManyGroups = async (ids: string[]) =>
    db.delete(groupsTable).where(inArray(groupsTable.id, ids)).returning()

export async function groupExists(id: string) {
    const groupCount = await db
        .select({ value: count() })
        .from(groupsTable)
        .where(eq(groupsTable.id, id))

    return groupCount?.[0]?.value === 1
}

export async function addUserToGroup(
    userId: string,
    groupId: string,
    roleId: string,
) {
    const [userGroup] = await db
        .insert(membershipsTable)
        .values({
            userId,
            groupId,
            roleId,
        })
        .returning()

    return userGroup
}

export const getAllGroupsExcept = async (params: {
    search: string
    page: number
    size: number
    orderBy?: string
    groupId?: string // Make it optional
}) => {
    const { search, page, size, orderBy, groupId } = params

    const conditions: SQL<unknown>[] = []

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

export const updateSubscriptionId = async (
    groupId: string,
    subscriptionId: string,
) =>
    db
        .update(groupsTable)
        .set({ subscriptionId })
        .where(eq(groupsTable.id, groupId))
        .returning()

export const getAllGroupsByUserId = async (userId: string) => {
    const groups = await db
        .select({
            ...getTableColumns(groupsTable),
        })
        .from(groupsTable)
        .innerJoin(
            membershipsTable,
            eq(groupsTable.id, membershipsTable.groupId),
        )
        .where(eq(membershipsTable.userId, userId))

    return groups
}

export const findMembership = async (groupId: string, userId: string) => {
    const result = await db
        .select()
        .from(membershipsTable)
        .where(
            and(
                eq(membershipsTable.groupId, groupId),
                eq(membershipsTable.userId, userId),
            ),
        )
        .limit(1)
    return result[0]
}

export const removeUserFromGroup = async (userId: string, groupId: string) => {
    return db
        .delete(membershipsTable)
        .where(
            and(
                eq(membershipsTable.userId, userId),
                eq(membershipsTable.groupId, groupId),
            ),
        )
        .execute()
}

export const removeAllGroupMembers = async (groupId: string) => {
    await db
        .delete(membershipsTable)
        .where(eq(membershipsTable.groupId, groupId))
}

export const removeGroupOwner = async (groupId: string) => {
    await db
        .update(groupsTable)
        .set({ creatorId: null })
        .where(eq(groupsTable.id, groupId))
}

export const deleteAllGroupInvites = async (groupId: string) => {
    await db.delete(invitesTable).where(eq(invitesTable.groupId, groupId))
}

export const deleteAllGroupRoles = async (groupId: string) => {
    await db.delete(rolesTable).where(eq(rolesTable.groupId, groupId))
}

export async function isUserAMember(
    userId: string,
    groupId: string,
): Promise<boolean> {
    const membership = await db
        .select({ userId: membershipsTable.userId })
        .from(membershipsTable)
        .where(
            and(
                eq(membershipsTable.userId, userId),
                eq(membershipsTable.groupId, groupId),
            ),
        )
        .limit(1)

    return membership.length > 0
}
