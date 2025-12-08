import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { usersTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertUser, QueryUsers, SelectUser } from './user-core.model'

export class UserCoreService {
    static async findMany(filters: QueryUsers): Promise<SelectUser[]> {
        const conditions = UserCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const users = await db
            .select()
            .from(usersTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return users
    }

    static async findOne(filters: QueryUsers): Promise<SelectUser | null> {
        const conditions = UserCoreService.buildWhereConditions(filters)
        const users = await db.select().from(usersTable).where(conditions).limit(1)
        return users[0] ?? null
    }

    static async findById(id: string): Promise<SelectUser | null> {
        const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)
        return user[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${usersTable.id})` })
            .from(usersTable)
            .where(eq(usersTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryUsers): Promise<number> {
        const conditions = UserCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${usersTable.id})` })
            .from(usersTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertUser): Promise<SelectUser> {
        const [user] = await db.insert(usersTable).values(input).returning()
        return user
    }

    static async createMany(inputs: InsertUser[]): Promise<SelectUser[]> {
        const users = await db.insert(usersTable).values(inputs).returning()
        return users
    }

    static async update(id: string, input: Partial<InsertUser>): Promise<SelectUser> {
        const [user] = await db
            .update(usersTable)
            .set(input)
            .where(eq(usersTable.id, id))
            .returning()
        return user
    }

    static async upsert(id: string, input: InsertUser): Promise<SelectUser> {
        const existingUser = await UserCoreService.findById(id)
        if (existingUser) {
            return UserCoreService.update(id, input)
        }
        return UserCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(usersTable).where(eq(usersTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(usersTable).where(inArray(usersTable.id, ids))
    }

    static buildWhereConditions(params: QueryUsers): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(
                or(
                    ilike(usersTable.firstName, searchTerm),
                    ilike(usersTable.lastName, searchTerm),
                    ilike(usersTable.email, searchTerm),
                    ilike(usersTable.username, searchTerm),
                ),
            )
        }
        if (params.username) {
            conditions.push(eq(usersTable.username, params.username))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(usersTable.id, params.ids))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
