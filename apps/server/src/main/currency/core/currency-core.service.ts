import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { currenciesTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import {
    InsertCurrency,
    QueryCurrencies,
    SelectCurrency,
} from './currency-core.model'

export class CurrencyCoreService {
    static async findMany(filters: QueryCurrencies): Promise<SelectCurrency[]> {
        const conditions = CurrencyCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const currencies = await db
            .select()
            .from(currenciesTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return currencies
    }

    static async findOne(
        filters: QueryCurrencies,
    ): Promise<SelectCurrency | null> {
        const conditions = CurrencyCoreService.buildWhereConditions(filters)
        const currencies = await db
            .select()
            .from(currenciesTable)
            .where(conditions)
            .limit(1)
        return currencies[0] ?? null
    }

    static async findById(id: string): Promise<SelectCurrency | null> {
        const currency = await db
            .select()
            .from(currenciesTable)
            .where(eq(currenciesTable.id, id))
            .limit(1)
        return currency[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: sql<number>`count(${currenciesTable.id})` })
            .from(currenciesTable)
            .where(eq(currenciesTable.id, id))
        const count = countResult[0]?.count || 0
        return count > 0
    }

    static async count(filters: QueryCurrencies): Promise<number> {
        const conditions = CurrencyCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${currenciesTable.id})` })
            .from(currenciesTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertCurrency): Promise<SelectCurrency> {
        const [currency] = await db
            .insert(currenciesTable)
            .values(input)
            .returning()
        return currency
    }

    static async createMany(
        inputs: InsertCurrency[],
    ): Promise<SelectCurrency[]> {
        const currencies = await db
            .insert(currenciesTable)
            .values(inputs)
            .returning()
        return currencies
    }

    static async update(
        id: string,
        input: Partial<InsertCurrency>,
    ): Promise<SelectCurrency> {
        const [currency] = await db
            .update(currenciesTable)
            .set(input)
            .where(eq(currenciesTable.id, id))
            .returning()
        return currency
    }

    static async upsert(
        id: string,
        input: InsertCurrency,
    ): Promise<SelectCurrency> {
        const existingCurrency = await CurrencyCoreService.findById(id)
        if (existingCurrency) {
            return CurrencyCoreService.update(id, input)
        }
        return CurrencyCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(currenciesTable).where(eq(currenciesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(currenciesTable).where(inArray(currenciesTable.id, ids))
    }

    static buildWhereConditions(
        params: QueryCurrencies,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(
                or(
                    ilike(currenciesTable.name, searchTerm),
                    ilike(currenciesTable.id, searchTerm),
                ),
            )
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(currenciesTable.id, params.ids))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
