import { InsertAccountType } from './core/account-type-core.model'

export const DEFAULT_ACCOUNT_TYPES: InsertAccountType[] = [
    {
        id: 'CreditCard',
        name: 'Credit Card',
        sortOrder: 1,
    },
    {
        id: 'Checking',
        name: 'Checking',
        sortOrder: 2,
    },
    {
        id: 'Savings',
        name: 'Savings',
        sortOrder: 3,
    },
    {
        id: 'Cash',
        name: 'Cash',
        sortOrder: 4,
    },
    {
        id: 'DebitCard',
        name: 'Debit/Gift Card',
        sortOrder: 5,
    },
    {
        id: 'Loan',
        name: 'Loan',
        sortOrder: 6,
    },
    {
        id: 'Investment',
        name: 'Investment',
        sortOrder: 7,
    },
]
