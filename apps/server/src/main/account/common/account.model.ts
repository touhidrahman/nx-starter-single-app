import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { accountsTable } from '../../../core/db/schema'
import { zPagination, zSearch } from '../../../core/models/common.schema'
import { zInsertAccount } from '../base/account-base.model'

export type InsertCardAccount = z.infer<typeof zInsertCardAccount>
export type UpdateCardAccount = z.infer<typeof zUpdateCardAccount>
export type InsertBankAccount = z.infer<typeof zInsertBankAccount>
export type UpdateBankAccount = z.infer<typeof zUpdateBankAccount>
export type InsertLoanAccount = z.infer<typeof zInsertLoanAccount>
export type UpdateLoanAccount = z.infer<typeof zUpdateLoanAccount>

const zCommonInsertAccount = zInsertAccount
    .pick({
        name: true,
        balance: true,
        currency: true,
        useForNetWorth: true,
        isPrivate: true,
        groupId: true,
        creatorId: true,
    })
    .required()

export const zInsertCardAccount = zInsertAccount
    .pick({
        cardNumber: true,
        cardHolderName: true,
        cardExpiryDate: true,
        cardLimit: true,
        cardMonthlyDueDate: true,
        cardMonthlyStatementDate: true,
        cardType: true,
    })
    .required()
    .extend(zCommonInsertAccount.shape)

export const zUpdateCardAccount = zInsertCardAccount.partial()

export const zInsertBankAccount = zInsertAccount
    .pick({
        bankAccountNumber: true,
        bankAccountOwnerName: true,
        bankAccountType: true,
        bankIban: true,
        bankName: true,
        bankRouting: true,
        bankSwiftCode: true,
    })
    .required()
    .extend(zCommonInsertAccount.shape)

export const zUpdateBankAccount = zInsertBankAccount.partial()

export const zInsertLoanAccount = zInsertAccount
    .pick({
        loanStartDate: true,
        loanEndDate: true,
        loanInterestRate: true,
        loanMonthlyDueDate: true,
    })
    .required()
    .extend(zCommonInsertAccount.shape)

export const zUpdateLoanAccount = zInsertLoanAccount.partial()

export const ACCOUNT_TYPE = {
    CARD: 1,
    BANK: 2,
    LOAN: 3,
} as const
