import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { rolesTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertRole, QueryRoles, SelectRole } from './role-core.model'

export class RoleCoreService {
    static async findMany(filters: QueryRoles): Promise<SelectRole[]> {
        const conditions = RoleCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const roles = await db
            .select()
            .from(rolesTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return roles
    }

    static async findOne(filters: QueryRoles): Promise<SelectRole | null> {
        const conditions = RoleCoreService.buildWhereConditions(filters)
        const roles = await db.select().from(rolesTable).where(conditions).limit(1)
        return roles[0] ?? null
    }

    static async findById(id: string): Promise<SelectRole | null> {
        const role = await db.select().from(rolesTable).where(eq(rolesTable.id, id)).limit(1)
        return role[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${rolesTable.id})` })
            .from(rolesTable)
            .where(eq(rolesTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryRoles): Promise<number> {
        const conditions = RoleCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${rolesTable.id})` })
            .from(rolesTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertRole): Promise<SelectRole> {
        const [role] = await db.insert(rolesTable).values(input).returning()
        return role
    }

    static async createMany(inputs: InsertRole[]): Promise<SelectRole[]> {
        const roles = await db.insert(rolesTable).values(inputs).returning()
        return roles
    }

    static async update(id: string, input: Partial<InsertRole>): Promise<SelectRole> {
        const [role] = await db
            .update(rolesTable)
            .set(input)
            .where(eq(rolesTable.id, id))
            .returning()
        return role
    }

    static async upsert(id: string, input: InsertRole): Promise<SelectRole> {
        const existingRole = await RoleCoreService.findById(id)
        if (existingRole) {
            return RoleCoreService.update(id, input)
        }
        return RoleCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(rolesTable).where(eq(rolesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(rolesTable).where(inArray(rolesTable.id, ids))
    }

    static buildWhereConditions(params: QueryRoles): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(
                or(ilike(rolesTable.name, searchTerm), ilike(rolesTable.description, searchTerm)),
            )
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(rolesTable.id, params.ids))
        }
        if (params.groupId) {
            conditions.push(eq(rolesTable.groupId, params.groupId))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
