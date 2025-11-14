import {
    and,
    count,
    eq,
    getTableColumns,
    ilike,
    inArray,
    or,
    SQL,
    sql,
} from 'drizzle-orm'
import { db } from '../../core/db/db'
import { accountsTable } from '../../core/db/schema'
import { DEFAULT_PAGE_SIZE } from '../../core/models/common.values'
import {
    FilterAccounts,
    InsertAccount,
    SelectAccount,
} from './account-crud.model'

export class AccountCrudService {
    static async findMany(filters: FilterAccounts): Promise<SelectAccount[]> {
        const whereClause = AccountCrudService.getWhereConditions(filters)
        const size = filters.size || DEFAULT_PAGE_SIZE
        const offset = ((filters.page || 1) - 1) * size
        const accounts = await db
            .select()
            .from(accountsTable)
            .where(whereClause)
            .offset(offset)
            .limit(size)
        return accounts
    }

    static async findById(id: string): Promise<SelectAccount | null> {
        const account = await db
            .select()
            .from(accountsTable)
            .where(eq(accountsTable.id, id))
            .limit(1)
        return account[0] || null
    }

    static async count(filters: FilterAccounts): Promise<number> {
        const whereClause = AccountCrudService.getWhereConditions(filters)

        const [{ count }] = await db
            .select({ count: sql<number>`count(${accountsTable.id})` })
            .from(accountsTable)
            .where(whereClause)
        return count
    }

    static async create(input: InsertAccount): Promise<SelectAccount> {
        const [account] = await db
            .insert(accountsTable)
            .values(input)
            .returning()
        return account
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

    static async delete(id: string): Promise<void> {
        await db.delete(accountsTable).where(eq(accountsTable.id, id))
    }
    static async deleteMany(ids: string[]): Promise<void> {
        await db.delete(accountsTable).where(inArray(accountsTable.id, ids))
    }

    static getWhereConditions(
        params: FilterAccounts,
    ): SQL<unknown> | undefined {
        const conditions: (SQL<unknown> | undefined)[] = []

        if (params.search) {
            const searchTerm = `%${params.search}%`
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
