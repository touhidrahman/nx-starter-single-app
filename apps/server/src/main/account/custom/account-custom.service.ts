import { SelectAccount } from '../base/account-base.model'
import { ACCOUNT_TYPE } from '../common/account-common.model'
import { AccountCommonService } from '../common/account-common.service'
import {
    InsertBankAccount,
    InsertCardAccount,
    InsertLoanAccount,
    UpdateBankAccount,
    UpdateCardAccount,
    UpdateLoanAccount,
} from './account-custom.model'

export class AccountCustomService extends AccountCommonService {
    static async createCardAccount(
        input: InsertCardAccount,
    ): Promise<SelectAccount> {
        return AccountCommonService.create({
            ...input,
            type: ACCOUNT_TYPE.CARD,
        })
    }

    static async createBankAccount(
        input: InsertBankAccount,
    ): Promise<SelectAccount> {
        return AccountCommonService.create({
            ...input,
            type: ACCOUNT_TYPE.BANK,
        })
    }

    static async createLoanAccount(
        input: InsertLoanAccount,
    ): Promise<SelectAccount> {
        return AccountCommonService.create({
            ...input,
            type: ACCOUNT_TYPE.LOAN,
        })
    }

    static async updateCardAccount(
        id: string,
        input: UpdateCardAccount,
    ): Promise<SelectAccount> {
        return AccountCommonService.update(id, { ...input })
    }

    static async updateBankAccount(
        id: string,
        input: UpdateBankAccount,
    ): Promise<SelectAccount> {
        return AccountCommonService.update(id, { ...input })
    }

    static async updateLoanAccount(
        id: string,
        input: UpdateLoanAccount,
    ): Promise<SelectAccount> {
        return AccountCommonService.update(id, { ...input })
    }
}
