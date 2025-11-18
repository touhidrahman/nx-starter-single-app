import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { categoriesTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import {
    InsertCategory,
    QueryCategories,
    SelectCategory,
} from './category-core.model'

export class CategoryCoreService {
    static async findMany(filters: QueryCategories): Promise<SelectCategory[]> {
        const conditions = CategoryCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const categories = await db
            .select()
            .from(categoriesTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return categories
    }

    static async findOne(
        filters: QueryCategories,
    ): Promise<SelectCategory | null> {
        const conditions = CategoryCoreService.buildWhereConditions(filters)
        const categories = await db
            .select()
            .from(categoriesTable)
            .where(conditions)
            .limit(1)
        return categories[0] ?? null
    }

    static async findById(id: string): Promise<SelectCategory | null> {
        const category = await db
            .select()
            .from(categoriesTable)
            .where(eq(categoriesTable.id, id))
            .limit(1)
        return category[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${categoriesTable.id})` })
            .from(categoriesTable)
            .where(eq(categoriesTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryCategories): Promise<number> {
        const conditions = CategoryCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${categoriesTable.id})` })
            .from(categoriesTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertCategory): Promise<SelectCategory> {
        const [category] = await db
            .insert(categoriesTable)
            .values(input)
            .returning()
        return category
    }

    static async createMany(
        inputs: InsertCategory[],
    ): Promise<SelectCategory[]> {
        const categories = await db
            .insert(categoriesTable)
            .values(inputs)
            .returning()
        return categories
    }

    static async update(
        id: string,
        input: Partial<InsertCategory>,
    ): Promise<SelectCategory> {
        const [category] = await db
            .update(categoriesTable)
            .set(input)
            .where(eq(categoriesTable.id, id))
            .returning()
        return category
    }

    static async upsert(
        id: string,
        input: InsertCategory,
    ): Promise<SelectCategory> {
        const existingCategory = await CategoryCoreService.findById(id)
        if (existingCategory) {
            return CategoryCoreService.update(id, input)
        }
        return CategoryCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(categoriesTable).where(eq(categoriesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(categoriesTable).where(inArray(categoriesTable.id, ids))
    }

    static buildWhereConditions(
        params: QueryCategories,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(categoriesTable.name, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(categoriesTable.id, params.ids))
        }
        if (params.groupId) {
            conditions.push(eq(categoriesTable.groupId, params.groupId))
        }
        if (params.creatorId) {
            conditions.push(eq(categoriesTable.creatorId, params.creatorId))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
