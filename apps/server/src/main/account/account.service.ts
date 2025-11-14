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
import { PgTableWithColumns, TableConfig } from 'drizzle-orm/pg-core'
import { db } from '../../core/db/db'
import { accountsTable } from '../../core/db/schema'
import { DEFAULT_PAGE_SIZE } from '../../core/models/common.values'
import {
    InsertBankAccount,
    InsertCardAccount,
    InsertLoanAccount,
    UpdateBankAccount,
    UpdateCardAccount,
    UpdateLoanAccount,
} from './account.model'
import {
    FilterAccounts,
    InsertAccount,
    SelectAccount,
} from './account-crud.model'
import { AccountCrudService } from './account-crud.service'

export class AccountService extends AccountCrudService {
    static async createCardAccount(
        input: InsertCardAccount,
    ): Promise<SelectAccount> {
        return AccountService.create({ ...input, type: 1 })
    }

    static async createBankAccount(
        input: InsertBankAccount,
    ): Promise<SelectAccount> {
        return AccountService.create({ ...input, type: 2 })
    }

    static async createLoanAccount(
        input: InsertLoanAccount,
    ): Promise<SelectAccount> {
        return AccountService.create({ ...input, type: 3 })
    }

    static async updateCardAccount(
        id: string,
        input: UpdateCardAccount,
    ): Promise<SelectAccount> {
        return AccountService.update(id, { ...input })
    }

    static async updateBankAccount(
        id: string,
        input: UpdateBankAccount,
    ): Promise<SelectAccount> {
        return AccountService.update(id, { ...input })
    }

    static async updateLoanAccount(
        id: string,
        input: UpdateLoanAccount,
    ): Promise<SelectAccount> {
        return AccountService.update(id, { ...input })
    }
}
