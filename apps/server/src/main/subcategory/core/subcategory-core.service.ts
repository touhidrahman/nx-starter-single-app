import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { subcategoriesTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import {
    InsertSubcategory,
    QuerySubcategories,
    SelectSubcategory,
} from './subcategory-core.model'

export class SubcategoryCoreService {
    static async findMany(
        filters: QuerySubcategories,
    ): Promise<SelectSubcategory[]> {
        const conditions = SubcategoryCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const subcategories = await db
            .select()
            .from(subcategoriesTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return subcategories
    }

    static async findOne(
        filters: QuerySubcategories,
    ): Promise<SelectSubcategory | null> {
        const conditions = SubcategoryCoreService.buildWhereConditions(filters)
        const subcategories = await db
            .select()
            .from(subcategoriesTable)
            .where(conditions)
            .limit(1)
        return subcategories[0] ?? null
    }

    static async findById(id: string): Promise<SelectSubcategory | null> {
        const subcategory = await db
            .select()
            .from(subcategoriesTable)
            .where(eq(subcategoriesTable.id, id))
            .limit(1)
        return subcategory[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${subcategoriesTable.id})` })
            .from(subcategoriesTable)
            .where(eq(subcategoriesTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QuerySubcategories): Promise<number> {
        const conditions = SubcategoryCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${subcategoriesTable.id})` })
            .from(subcategoriesTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertSubcategory): Promise<SelectSubcategory> {
        const [subcategory] = await db
            .insert(subcategoriesTable)
            .values(input)
            .returning()
        return subcategory
    }

    static async createMany(
        inputs: InsertSubcategory[],
    ): Promise<SelectSubcategory[]> {
        const subcategories = await db
            .insert(subcategoriesTable)
            .values(inputs)
            .returning()
        return subcategories
    }

    static async update(
        id: string,
        input: Partial<InsertSubcategory>,
    ): Promise<SelectSubcategory> {
        const [subcategory] = await db
            .update(subcategoriesTable)
            .set(input)
            .where(eq(subcategoriesTable.id, id))
            .returning()
        return subcategory
    }

    static async upsert(
        id: string,
        input: InsertSubcategory,
    ): Promise<SelectSubcategory> {
        const existingSubcategory = await SubcategoryCoreService.findById(id)
        if (existingSubcategory) {
            return SubcategoryCoreService.update(id, input)
        }
        return SubcategoryCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(subcategoriesTable).where(eq(subcategoriesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db
            .delete(subcategoriesTable)
            .where(inArray(subcategoriesTable.id, ids))
    }

    static buildWhereConditions(
        params: QuerySubcategories,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(subcategoriesTable.name, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(subcategoriesTable.id, params.ids))
        }
        if (params.groupId) {
            conditions.push(eq(subcategoriesTable.groupId, params.groupId))
        }
        if (params.creatorId) {
            conditions.push(eq(subcategoriesTable.creatorId, params.creatorId))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
