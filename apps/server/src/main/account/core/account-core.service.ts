import { and, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm'
import { db } from '../../../db/db'
import { accountsTable } from '../../../db/schema'
import { DEFAULT_PAGE_SIZE } from '../../../models/common.values'
import {
    InsertAccount,
    QueryAccounts,
    SelectAccount,
} from './account-core.model'

export class AccountCoreService {
    static async findMany(filters: QueryAccounts): Promise<SelectAccount[]> {
        const conditions = AccountCoreService.buildWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const accounts = await db
            .select()
            .from(accountsTable)
            .where(conditions)
            .offset(offset)
            .limit(size)
        return accounts
    }

    static async findOne(
        filters: QueryAccounts,
    ): Promise<SelectAccount | null> {
        const conditions = AccountCoreService.buildWhereConditions(filters)
        const accounts = await db
            .select()
            .from(accountsTable)
            .where(conditions)
            .limit(1)
        return accounts[0] ?? null
    }

    static async findById(id: string): Promise<SelectAccount | null> {
        const account = await db
            .select()
            .from(accountsTable)
            .where(eq(accountsTable.id, id))
            .limit(1)
        return account[0] || null
    }

    static async count(filters: QueryAccounts): Promise<number> {
        const conditions = AccountCoreService.buildWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${accountsTable.id})` })
            .from(accountsTable)
            .where(conditions)
        return count
    }

    static async create(input: InsertAccount): Promise<SelectAccount> {
        const [account] = await db
            .insert(accountsTable)
            .values(input)
            .returning()
        return account
    }

    static async createMany(inputs: InsertAccount[]): Promise<SelectAccount[]> {
        const accounts = await db
            .insert(accountsTable)
            .values(inputs)
            .returning()
        return accounts
    }

    static async update(
        id: string,
        input: Partial<InsertAccount>,
    ): Promise<SelectAccount> {
        const [account] = await db
            .update(accountsTable)
            .set(input)
            .where(eq(accountsTable.id, id))
            .returning()
        return account
    }

    static async upsert(
        id: string,
        input: InsertAccount,
    ): Promise<SelectAccount> {
        const existingAccount = await AccountCoreService.findById(id)
        if (existingAccount) {
            return AccountCoreService.update(id, input)
        }
        return AccountCoreService.create(input)
    }

    static async delete(id: string): Promise<void> {
        await db.delete(accountsTable).where(eq(accountsTable.id, id))
    }

    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(accountsTable).where(inArray(accountsTable.id, ids))
    }

    static buildWhereConditions(
        params: QueryAccounts,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search.trim()}%`
            conditions.push(or(ilike(accountsTable.name, searchTerm)))
        }
        if (params.ids && params.ids.length > 0) {
            conditions.push(inArray(accountsTable.id, params.ids))
        }
        if (params.type) {
            conditions.push(eq(accountsTable.type, params.type))
        }
        if (params.cardType) {
            conditions.push(eq(accountsTable.cardType, params.cardType))
        }
        if (params.groupId) {
            conditions.push(eq(accountsTable.groupId, params.groupId))
        }
        if (params.creatorId) {
            conditions.push(eq(accountsTable.creatorId, params.creatorId))
        }
        if (conditions.length === 0) {
            return undefined
        }
        return and(...conditions)
    }
}
