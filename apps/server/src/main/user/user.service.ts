import {
    and,
    count,
    eq,
    getTableColumns,
    ilike,
    lt,
    SQL,
    sql,
} from 'drizzle-orm'
import { db } from '../../core/db/db'
import {
    groupsTable,
    rolesTable,
    usersGroupsTable,
    usersTable,
} from '../../core/db/schema'
import { Member, UserDto } from './user.schema'

type UsersQueryParams = {
    page?: number
    size?: number
    orderBy?: string
    search?: string
    id?: string
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    country?: string
    postCode?: string
    groupType?: 'client' | 'vendor'
    status?: 'active' | 'inactive' | 'banned'
    level?: 'user' | 'moderator' | 'admin'
}

type UsersFilterParams = Omit<UsersQueryParams, 'page' | 'size' | 'orderBy'>

export const findUsers = async (params: UsersQueryParams) => {
    const { page = 1, size = 20, orderBy, ...filterParams } = params
    const whereClause = getUsersWhereConditions(filterParams)
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(usersTable),
            groupName: groupsTable.name,
        })
        .from(usersTable)
        .leftJoin(groupsTable, eq(usersTable.defaultGroupId, groupsTable.id))
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        let column: any
        switch (orderBy) {
            case 'createdAt':
                column = usersTable.createdAt
                break
            case 'lastLogin':
                column = usersTable.lastLogin
                break
            default:
                column = usersTable.createdAt
        }
        query.orderBy(sql`${column} DESC`)
    } else {
        query.orderBy(sql`${usersTable.createdAt} DESC`)
    }

    return await query
}

export const getUsersWhereConditions = (
    params: UsersFilterParams,
): SQL<unknown> | undefined => {
    const {
        search,
        id,
        email,
        phone,
        firstName,
        lastName,
        city,
        country,
        postCode,
        groupType,
        status,
    } = params

    const conditions: SQL<unknown>[] = []

    if (id) conditions.push(eq(usersTable.id, id))
    if (email) conditions.push(eq(usersTable.email, email))
    if (phone) conditions.push(eq(usersTable.phone, phone))
    if (firstName) conditions.push(eq(usersTable.firstName, firstName))
    if (lastName) conditions.push(eq(usersTable.lastName, lastName))
    if (city) conditions.push(eq(usersTable.city, city))
    if (country) conditions.push(eq(usersTable.country, country))
    if (postCode) conditions.push(eq(usersTable.postCode, postCode))

    if (groupType) {
        conditions.push(eq(groupsTable.type, groupType))
    }

    if (status) {
        conditions.push(eq(usersTable.status, status))
    }

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(
            sql`(${ilike(usersTable.email, searchTerm)} OR ${ilike(usersTable.phone, searchTerm)} OR ${ilike(
                sql`LOWER(${usersTable.firstName} || ' ' || ${usersTable.lastName})`,
                searchTerm,
            )})`,
        )
    }

    return conditions.length > 0 ? and(...conditions) : undefined
}

export const countUsers = async (params: UsersQueryParams): Promise<number> => {
    const whereClause = getUsersWhereConditions(params)

    const query = db
        .select({
            count: count(),
        })
        .from(usersTable)
        .leftJoin(groupsTable, eq(usersTable.defaultGroupId, groupsTable.id))

    if (whereClause) {
        query.where(whereClause)
    }

    const result = await query
    return result[0]?.count || 0
}

export async function findUserById(id: string) {
    return db.query.usersTable.findFirst({
        where: eq(usersTable.id, id),
    })
}

export async function deleteUsersByIds(id: string) {
    return db.delete(usersTable).where(eq(usersTable.id, id)).returning()
}

export async function createUser(user: UserDto) {
    return db.insert(usersTable).values(user).returning()
}

export async function updateUser(id: string, user: Partial<UserDto>) {
    return db
        .update(usersTable)
        .set(user)
        .where(eq(usersTable.id, id))
        .returning()
}

export async function deleteUser(id: string) {
    return db.delete(usersTable).where(eq(usersTable.id, id)).returning()
}

export async function userExists(id: string) {
    const userCount = await db
        .select({ value: count() })
        .from(usersTable)
        .where(eq(usersTable.id, id))

    return userCount?.[0]?.value === 1
}

export async function changeUserRole(userId: string, roleId: string) {
    const [updatedUser] = await db
        .update(usersGroupsTable)
        .set({ roleId })
        .where(eq(usersGroupsTable.userId, userId))
        .returning()

    return updatedUser
}

//!TODD: remove any
export const updateProfile = async (
    userId: string,
    updates: Record<string, any>,
    options?: { restrictFields?: string[] },
) => {
    const restrictFields = options?.restrictFields || []
    const allowedUpdates = Object.fromEntries(
        Object.entries(updates).filter(
            ([key]) => !restrictFields.includes(key),
        ),
    )

    if (Object.keys(allowedUpdates).length === 0) {
        return [null] // No valid updates
    }

    const [updatedUser] = await db
        .update(usersTable)
        .set(allowedUpdates)
        .where(eq(usersTable.id, userId))
        .returning() // Return the updated user

    return [updatedUser]
}

export const updateUserProfilePictureUrl = async (
    url: string,
    userId: string,
) => {
    return db
        .update(usersTable)
        .set({ profilePhoto: url })
        .where(eq(usersTable.id, userId))
        .returning()
}

export const getUsersByGroupId = async (groupId: string) => {
    const result = await db
        .select({
            id: usersTable.id,
            username: usersTable.username,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            email: usersTable.email,
            coverPhoto: usersTable.coverPhoto,
            profilePhoto: usersTable.profilePhoto,
            phone: usersTable.phone,
            address: usersTable.address,
            city: usersTable.city,
            state: usersTable.state,
            country: usersTable.country,
            postCode: usersTable.postCode,
            url: usersTable.url,
            bio: usersTable.bio,
            lastLogin: usersTable.lastLogin,
            status: usersTable.status,
            verified: usersTable.verified,
            defaultGroupId: usersTable.defaultGroupId,
            createdAt: usersTable.createdAt,
            updatedAt: usersTable.updatedAt,
            roleId: usersGroupsTable.roleId,
            roleName: rolesTable.name,
        })
        .from(usersTable)
        .innerJoin(usersGroupsTable, eq(usersTable.id, usersGroupsTable.userId))
        .innerJoin(groupsTable, eq(usersGroupsTable.groupId, groupsTable.id))
        .innerJoin(rolesTable, eq(usersGroupsTable.roleId, rolesTable.id))
        .where(eq(groupsTable.id, groupId))
        .execute()

    return result
}

// TODO: add this to cron job
export const deleteUnverifiedUsers = async () => {
    const THIRTY_DAYS_AGO = new Date()
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30)

    const usersToDelete = await db
        .select()
        .from(usersTable)
        .where(
            and(
                eq(usersTable.verified, false),
                lt(usersTable.createdAt, THIRTY_DAYS_AGO),
            ),
        )

    if (usersToDelete.length === 0) return []

    // Delete users
    await db
        .delete(usersTable)
        .where(
            and(
                eq(usersTable.verified, false),
                lt(usersTable.createdAt, THIRTY_DAYS_AGO),
            ),
        )

    return usersToDelete
}

export async function findGroupsOwnedByUser(userId: string) {
    const ownedGroups = await db.query.groupsTable.findMany({
        where: eq(groupsTable.ownerId, userId),
    })
    return [...ownedGroups]
}

export async function removeAllMembershipsOfUser(userId: string) {
    await db.delete(usersGroupsTable).where(eq(usersGroupsTable.userId, userId))
}

export const findUserBasicInfoById = async (
    userId: string,
): Promise<Member | null> => {
    if (!userId) return null

    const [user] = await db
        .select({
            id: usersTable.id,
            email: usersTable.email,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            profilePhoto: usersTable.profilePhoto,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))

    return user || null
}
