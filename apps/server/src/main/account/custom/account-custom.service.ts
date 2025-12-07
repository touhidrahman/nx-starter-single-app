import { SelectAccount } from '../core/account-core.model'
import { AccountCrudService } from '../crud/account-crud.service'
import {
    InsertBankAccount,
    InsertCardAccount,
    InsertLoanAccount,
    UpdateBankAccount,
    UpdateCardAccount,
    UpdateLoanAccount,
} from './account-custom.model'

export class AccountCustomService extends AccountCrudService {
    static async createCardAccount(input: InsertCardAccount): Promise<SelectAccount> {
        return AccountCrudService.create({
            ...input,
        })
    }

    static async createBankAccount(input: InsertBankAccount): Promise<SelectAccount> {
        return AccountCrudService.create({
            ...input,
        })
    }

    static async createLoanAccount(input: InsertLoanAccount): Promise<SelectAccount> {
        return AccountCrudService.create({
            ...input,
        })
    }

    static async updateCardAccount(id: string, input: UpdateCardAccount): Promise<SelectAccount> {
        return AccountCrudService.update(id, { ...input })
    }

    static async updateBankAccount(id: string, input: UpdateBankAccount): Promise<SelectAccount> {
        return AccountCrudService.update(id, { ...input })
    }

    static async updateLoanAccount(id: string, input: UpdateLoanAccount): Promise<SelectAccount> {
        return AccountCrudService.update(id, { ...input })
    }
}
