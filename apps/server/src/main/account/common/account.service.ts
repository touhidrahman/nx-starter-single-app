import { SelectAccount } from '../base/account-base.model'
import { AccountBaseService } from '../base/account-base.service'
import {
    ACCOUNT_TYPE,
    InsertBankAccount,
    InsertCardAccount,
    InsertLoanAccount,
    UpdateBankAccount,
    UpdateCardAccount,
    UpdateLoanAccount,
} from './account.model'

export class AccountService extends AccountBaseService {
    static async createCardAccount(
        input: InsertCardAccount,
    ): Promise<SelectAccount> {
        return AccountService.create({ ...input, type: ACCOUNT_TYPE.CARD })
    }

    static async createBankAccount(
        input: InsertBankAccount,
    ): Promise<SelectAccount> {
        return AccountService.create({ ...input, type: ACCOUNT_TYPE.BANK })
    }

    static async createLoanAccount(
        input: InsertLoanAccount,
    ): Promise<SelectAccount> {
        return AccountService.create({ ...input, type: ACCOUNT_TYPE.LOAN })
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
