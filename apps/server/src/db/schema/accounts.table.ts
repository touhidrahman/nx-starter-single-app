import { boolean, date, decimal, index, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountTypesTable } from './account-types.table'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const accountsTable = pgTable(
    'accounts',
    {
        id: text().primaryKey().$defaultFn(generateId),
        type: text()
            .notNull()
            .references(() => accountTypesTable.id),
        name: text(),
        balance: decimal().notNull().default('0.00'),
        currency: text().notNull().default('USD'),
        useForNetWorth: boolean().notNull().default(true),
        monthlyBudget: decimal(),
        isPrivate: boolean().notNull().default(false),
        icon: text(),
        color: text(),

        bankAccountOwnerName: text(),
        bankAccountNumber: text(),
        bankAccountType: text(),
        bankIban: text(),
        bankName: text(),
        bankRouting: text(),
        bankSwiftCode: text(),

        cardExpiryDate: date(),
        cardHolderName: text(),
        cardLimit: decimal(),
        cardMonthlyDueDate: integer(),
        cardMonthlyStatementDate: integer(),
        cardNumber: text(),
        cardType: text(),

        loanEndDate: date(),
        loanInterestRate: decimal(),
        loanMonthlyDueDate: integer(),
        loanStartDate: date(),

        groupId: text()
            .notNull()
            .references(() => groupsTable.id, { onDelete: 'cascade' }),
        creatorId: text()
            .notNull()
            .references(() => usersTable.id, { onDelete: 'set null' }),

        ...timestampColumns,
    },
    (table) => [
        index('accounts_creator_id_idx').on(table.creatorId),
        index('accounts_group_id_idx').on(table.groupId),
        index('accounts_type_idx').on(table.type),
    ],
)
