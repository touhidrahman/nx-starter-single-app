import { and, asc, count, desc, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../db/db'
import { transactionSchedulesTable } from '../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../models/common.values'
import {
    InsertTransactionSchedule,
    QueryTransactionSchedules,
    SelectTransactionSchedule,
} from './transaction-schedule.model'

export class TransactionScheduleCoreService {
    static async findMany(
        filters: QueryTransactionSchedules,
    ): Promise<SelectTransactionSchedule[]> {
        const conditions = TransactionScheduleCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const orderBy = TransactionScheduleCoreService.buildOrderBy(
            filters.orderBy as keyof SelectTransactionSchedule,
            filters.sortOrder ?? 'desc',
        )

        const transactionSchedules = await db
            .select()
            .from(transactionSchedulesTable)
            .where(conditions)
            .offset(offset)
            .orderBy(orderBy)
            .limit(size)
        return transactionSchedules
    }

    static async findOne(
        filters: QueryTransactionSchedules,
    ): Promise<SelectTransactionSchedule | null> {
        const conditions = TransactionScheduleCoreService.buildWhereConditions(filters)
        const transactionSchedules = await db
            .select()
            .from(transactionSchedulesTable)
            .where(conditions)
            .limit(1)
        return transactionSchedules[0] ?? null
    }

    static async findById(id: string): Promise<SelectTransactionSchedule | null> {
        const transactionSchedule = await db
            .select()
            .from(transactionSchedulesTable)
            .where(eq(transactionSchedulesTable.id, id))
            .limit(1)
        return transactionSchedule[0] || null
    }

    static async exists(id: string): Promise<boolean> {
        const countResult = await db
            .select({ count: count() })
            .from(transactionSchedulesTable)
            .where(eq(transactionSchedulesTable.id, id))
        const total = countResult[0]?.count || 0
        return total > 0
    }

    static async count(filters: QueryTransactionSchedules): Promise<number> {
        const conditions = TransactionScheduleCoreService.buildWhereConditions(filters)

        const countResult = await db
            .select({ count: count() })
            .from(transactionSchedulesTable)
            .where(conditions)
        return countResult[0]?.count || 0
    }

    static async create(input: InsertTransactionSchedule): Promise<SelectTransactionSchedule> {
        const [transactionSchedule] = await db
            .insert(transactionSchedulesTable)
            .values(input)
            .returning()
        return transactionSchedule
    }

    static async createMany(
        inputs: InsertTransactionSchedule[],
    ): Promise<SelectTransactionSchedule[]> {
        const transactionSchedules = await db
            .insert(transactionSchedulesTable)
            .values(inputs)
            .returning()
        return transactionSchedules
    }

    static async update(
        id: string,
        input: Partial<InsertTransactionSchedule>,
    ): Promise<SelectTransactionSchedule> {
        const [transactionSchedule] = await db
            .update(transactionSchedulesTable)
            .set(input)
            .where(eq(transactionSchedulesTable.id, id))
            .returning()
        return transactionSchedule
    }

    static async upsert(
        id: string,
        input: InsertTransactionSchedule,
    ): Promise<SelectTransactionSchedule> {
        const existingTransactionSchedule = await TransactionScheduleCoreService.findById(id)
        if (existingTransactionSchedule) {
            return TransactionScheduleCoreService.update(id, input)
        }
        return TransactionScheduleCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(transactionSchedulesTable).where(eq(transactionSchedulesTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(transactionSchedulesTable).where(inArray(transactionSchedulesTable.id, ids))
    }

    static async deleteManyByQuery(filters: QueryTransactionSchedules): Promise<void> {
        const conditions = TransactionScheduleCoreService.buildWhereConditions(filters)
        await db.delete(transactionSchedulesTable).where(conditions)
    }

    static buildOrderBy(
        orderByField: keyof SelectTransactionSchedule,
        sortOrder: 'asc' | 'desc',
    ): SQL<unknown> {
        const orderBy =
            transactionSchedulesTable[orderByField] ?? transactionSchedulesTable.createdAt
        return sortOrder === 'asc' ? asc(orderBy) : desc(orderBy)
    }

    static buildWhereConditions(params: QueryTransactionSchedules): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(transactionSchedulesTable.title, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(transactionSchedulesTable.id, params.ids))
        }
        if (params.id) {
            conditions.push(eq(transactionSchedulesTable.id, params.id))
        }
        if (params.groupId) {
            conditions.push(eq(transactionSchedulesTable.groupId, params.groupId))
        }
        if (params.creatorId) {
            conditions.push(eq(transactionSchedulesTable.creatorId, params.creatorId))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
