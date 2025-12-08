import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { groupsTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertGroup, QueryGroups, SelectGroup } from './group-core.model'

export class GroupCoreService {
    static async findMany(filters: QueryGroups): Promise<SelectGroup[]> {
        const conditions = GroupCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const groups = await db
            .select()
            .from(groupsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return groups
    }

    static async findOne(filters: QueryGroups): Promise<SelectGroup | null> {
        const conditions = GroupCoreService.buildWhereConditions(filters)
        const groups = await db.select().from(groupsTable).where(conditions).limit(1)
        return groups[0] ?? null
    }

    static async findById(id: string): Promise<SelectGroup | null> {
        const group = await db.select().from(groupsTable).where(eq(groupsTable.id, id)).limit(1)
        return group[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${groupsTable.id})` })
            .from(groupsTable)
            .where(eq(groupsTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryGroups): Promise<number> {
        const conditions = GroupCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${groupsTable.id})` })
            .from(groupsTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertGroup): Promise<SelectGroup> {
        const [group] = await db.insert(groupsTable).values(input).returning()
        return group
    }

    static async createMany(inputs: InsertGroup[]): Promise<SelectGroup[]> {
        const groups = await db.insert(groupsTable).values(inputs).returning()
        return groups
    }

    static async update(id: string, input: Partial<InsertGroup>): Promise<SelectGroup> {
        const [group] = await db
            .update(groupsTable)
            .set(input)
            .where(eq(groupsTable.id, id))
            .returning()
        return group
    }

    static async upsert(id: string, input: InsertGroup): Promise<SelectGroup> {
        const existingGroup = await GroupCoreService.findById(id)
        if (existingGroup) {
            return GroupCoreService.update(id, input)
        }
        return GroupCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(groupsTable).where(eq(groupsTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(groupsTable).where(inArray(groupsTable.id, ids))
    }

    static buildWhereConditions(params: QueryGroups): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(groupsTable.name, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(groupsTable.id, params.ids))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
