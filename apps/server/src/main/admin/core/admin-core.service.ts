import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { adminsTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertAdmin, QueryAdmins, SelectAdmin } from './admin-core.model'

export class AdminCoreService {
    static async findMany(filters: QueryAdmins): Promise<SelectAdmin[]> {
        const conditions = AdminCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const admins = await db
            .select()
            .from(adminsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return admins
    }

    static async findOne(filters: QueryAdmins): Promise<SelectAdmin | null> {
        const conditions = AdminCoreService.buildWhereConditions(filters)
        const admins = await db
            .select()
            .from(adminsTable)
            .where(conditions)
            .limit(1)
        return admins[0] ?? null
    }

    static async findById(id: string): Promise<SelectAdmin | null> {
        const admin = await db
            .select()
            .from(adminsTable)
            .where(eq(adminsTable.id, id))
            .limit(1)
        return admin[0] || null
    }

    static async count(filters: QueryAdmins): Promise<number> {
        const conditions = AdminCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${adminsTable.id})` })
            .from(adminsTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertAdmin): Promise<SelectAdmin> {
        const [admin] = await db.insert(adminsTable).values(input).returning()
        return admin
    }

    static async createMany(inputs: InsertAdmin[]): Promise<SelectAdmin[]> {
        const admins = await db.insert(adminsTable).values(inputs).returning()
        return admins
    }

    static async update(
        id: string,
        input: Partial<InsertAdmin>,
    ): Promise<SelectAdmin> {
        const [admin] = await db
            .update(adminsTable)
            .set(input)
            .where(eq(adminsTable.id, id))
            .returning()
        return admin
    }

    static async upsert(id: string, input: InsertAdmin): Promise<SelectAdmin> {
        const existingAdmin = await AdminCoreService.findById(id)
        if (existingAdmin) {
            return AdminCoreService.update(id, input)
        }
        return AdminCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(adminsTable).where(eq(adminsTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(adminsTable).where(inArray(adminsTable.id, ids))
    }

    static buildWhereConditions(params: QueryAdmins): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(adminsTable.name, searchTerm)))
        }
        if (params.email) {
            conditions.push(
                ilike(adminsTable.email, `%${params.email.trim()}%`),
            )
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(adminsTable.id, params.ids))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
