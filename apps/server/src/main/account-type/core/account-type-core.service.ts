import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { accountTypesTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import { InsertAccountType, QueryAccountTypes, SelectAccountType } from './account-type-core.model'

export class AccountTypeCoreService {
    static async findMany(filters: QueryAccountTypes): Promise<SelectAccountType[]> {
        const conditions = AccountTypeCoreService.buildWhereConditions(filters)
        const size = filters.size ?? DEFAULT_PAGE_SIZE
        const offset = ((filters.page ?? 1) - 1) * size
        const accountTypes = await db
            .select()
            .from(accountTypesTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return accountTypes
    }

    static async findOne(filters: QueryAccountTypes): Promise<SelectAccountType | null> {
        const conditions = AccountTypeCoreService.buildWhereConditions(filters)
        const accountTypes = await db.select().from(accountTypesTable).where(conditions).limit(1)
        return accountTypes[0] ?? null
    }

    static async findById(id: string): Promise<SelectAccountType | null> {
        const accountType = await db
            .select()
            .from(accountTypesTable)
            .where(eq(accountTypesTable.id, id))
            .limit(1)
        return accountType[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${accountTypesTable.id})` })
            .from(accountTypesTable)
            .where(eq(accountTypesTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryAccountTypes): Promise<number> {
        const conditions = AccountTypeCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${accountTypesTable.id})` })
            .from(accountTypesTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertAccountType): Promise<SelectAccountType> {
        const [accountType] = await db.insert(accountTypesTable).values(input).returning()
        return accountType
    }

    static async createMany(inputs: InsertAccountType[]): Promise<SelectAccountType[]> {
        const accountTypes = await db.insert(accountTypesTable).values(inputs).returning()
        return accountTypes
    }

    static async update(id: string, input: Partial<InsertAccountType>): Promise<SelectAccountType> {
        const [accountType] = await db
            .update(accountTypesTable)
            .set(input)
            .where(eq(accountTypesTable.id, id))
            .returning()
        return accountType
    }

    static async upsert(id: string, input: InsertAccountType): Promise<SelectAccountType> {
        const existingAccountType = await AccountTypeCoreService.findById(id)
        if (existingAccountType) {
            return AccountTypeCoreService.update(id, input)
        }
        return AccountTypeCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(accountTypesTable).where(eq(accountTypesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(accountTypesTable).where(inArray(accountTypesTable.id, ids))
    }

    static buildWhereConditions(params: QueryAccountTypes): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(accountTypesTable.name, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(accountTypesTable.id, params.ids))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
