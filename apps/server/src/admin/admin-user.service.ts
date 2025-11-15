import { and, count, eq, getTableColumns, ilike, SQL, sql } from 'drizzle-orm'
import { db } from '../db/db'
import { adminsTable } from '../db/schema'
import { InsertAdmin, SelectAdmin } from './admin.schema'

export const getAllAdmins = async (params: {
    search?: string
    page: number
    size: number
    orderBy?: string
}) => {
    const { search, page, size, orderBy } = params

    const conditions: SQL<unknown>[] = []

    if (search) {
        const searchTerm = `%${search}%`
        conditions.push(sql`(${ilike(adminsTable.email, searchTerm)}`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * size

    const query = db
        .select({
            ...getTableColumns(adminsTable),
        })
        .from(adminsTable)
        .limit(size)
        .offset(offset)

    if (whereClause) {
        query.where(whereClause)
    }

    if (orderBy) {
        const direction = orderBy.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
        query.orderBy(sql`${adminsTable.createdAt} ${sql.raw(direction)}`)
    }

    const results = await query

    const totalCountQuery = await db
        .select({ count: count() })
        .from(adminsTable)

    const totalCount = totalCountQuery[0]?.count || 0

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

export async function approveAdminUser(adminId: string) {
    try {
        const result = await db
            .update(adminsTable)
            .set({ verifiedAt: new Date() })
            .where(and(eq(adminsTable.id, adminId)))
            .returning()

        if (result.length === 0) {
            return {
                message: 'User not found or already approved',
                code: 404,
            }
        }

        return { message: 'Admin account approved', code: 200 }
    } catch (error) {
        throw new Error('Approval failed')
    }
}

export async function adminUserExists(adminId: string) {
    const userCount = await db
        .select({ value: count() })
        .from(adminsTable)
        .where(eq(adminsTable.id, adminId))

    return userCount?.[0]?.value === 1
}

export async function getAdminUserById(adminId: string) {
    const user = await db
        .select({
            ...getTableColumns(adminsTable),
        })
        .from(adminsTable)
        .where(eq(adminsTable.id, adminId))
        .limit(1)

    return user[0] || null
}

export async function getAdminUserByEmail(email: string) {
    const user = await db
        .select({
            ...getTableColumns(adminsTable),
        })
        .from(adminsTable)
        .where(eq(adminsTable.email, email))
        .limit(1)

    return user[0] || null
}

export async function createAdminUser(user: InsertAdmin) {
    const [createdUser] = await db
        .insert(adminsTable)
        .values({
            email: user.email,
            password: user.password,
            name: user.name,
            verifiedAt: user.verifiedAt,
        })
        .returning()

    return createdUser
}

export async function updateAdminUser(
    adminId: string,
    user: Partial<InsertAdmin>,
) {
    const result = await db
        .update(adminsTable)
        .set({
            email: user.email,
            password: user.password,
            name: user.name,
        })
        .where(and(eq(adminsTable.id, adminId)))
        .returning()

    return result
}

export function removeAdminPassword(admin: SelectAdmin): SelectAdmin {
    return { ...admin, password: '' }
}

export async function findAdminById(id: string) {
    return await db.query.adminsTable.findFirst({
        where: eq(adminsTable.id, id),
    })
}

export async function findAdminByEmail(email: string) {
    return await db.query.adminsTable.findFirst({
        where: eq(adminsTable.email, email.toLowerCase()),
    })
}
