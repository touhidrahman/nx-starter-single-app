import { and, count, eq, gte, ilike, inArray, lte, or, SQL } from 'drizzle-orm'
import { db } from '../../db/db'
import { transactionsTable } from '../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../models/common.values'
import {
    InsertTransaction,
    QueryTransactions,
    SelectTransaction,
} from './transaction.model'

export class TransactionCoreService {
    static async findMany(
        filters: QueryTransactions,
    ): Promise<SelectTransaction[]> {
        const conditions = TransactionCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const transactions = await db
            .select()
            .from(transactionsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return transactions
    }

    static async findOne(
        filters: QueryTransactions,
    ): Promise<SelectTransaction | null> {
        const conditions = TransactionCoreService.buildWhereConditions(filters)
        const transactions = await db
            .select()
            .from(transactionsTable)
            .where(conditions)
            .limit(1)
        return transactions[0] ?? null
    }

    static async findById(id: string): Promise<SelectTransaction | null> {
        const transaction = await db
            .select()
            .from(transactionsTable)
            .where(eq(transactionsTable.id, id))
            .limit(1)
        return transaction[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: count() })
            .from(transactionsTable)
            .where(eq(transactionsTable.id, id))
        const total = countResult[0]?.count || 0
        return total > 0
    }

    static async count(filters: QueryTransactions): Promise<number> {
        const conditions = TransactionCoreService.buildWhereConditions(filters)

        const countResult = await db
            .select({ count: count() })
            .from(transactionsTable)
            .where(conditions)
        return countResult[0]?.count || 0
    }

    static async create(input: InsertTransaction): Promise<SelectTransaction> {
        const [transaction] = await db
            .insert(transactionsTable)
            .values(input)
            .returning()
        return transaction
    }

    static async createMany(
        inputs: InsertTransaction[],
    ): Promise<SelectTransaction[]> {
        const transactions = await db
            .insert(transactionsTable)
            .values(inputs)
            .returning()
        return transactions
    }

    static async update(
        id: string,
        input: Partial<InsertTransaction>,
    ): Promise<SelectTransaction> {
        const [transaction] = await db
            .update(transactionsTable)
            .set(input)
            .where(eq(transactionsTable.id, id))
            .returning()
        return transaction
    }

    static async upsert(
        id: string,
        input: InsertTransaction,
    ): Promise<SelectTransaction> {
        const existingTransaction = await TransactionCoreService.findById(id)
        if (existingTransaction) {
            return TransactionCoreService.update(id, input)
        }
        return TransactionCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(transactionsTable).where(eq(transactionsTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db
            .delete(transactionsTable)
            .where(inArray(transactionsTable.id, ids))
    }

    static async deleteManyByQuery(filters: QueryTransactions): Promise<void> {
        const conditions = TransactionCoreService.buildWhereConditions(filters)
        await db.delete(transactionsTable).where(conditions)
    }

    static buildWhereConditions(
        params: QueryTransactions,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(transactionsTable.title, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(transactionsTable.id, params.ids))
        }
        if (params.id) {
            conditions.push(eq(transactionsTable.id, params.id))
        }
        if (params.groupId) {
            conditions.push(eq(transactionsTable.groupId, params.groupId))
        }
        if (params.creatorId) {
            conditions.push(eq(transactionsTable.creatorId, params.creatorId))
        }
        if (params.accountId) {
            conditions.push(eq(transactionsTable.accountId, params.accountId))
        }
        if (params.startDate) {
            conditions.push(
                gte(transactionsTable.committedAt, new Date(params.startDate)),
            )
        }
        if (params.endDate) {
            conditions.push(
                lte(transactionsTable.committedAt, new Date(params.endDate)),
            )
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
