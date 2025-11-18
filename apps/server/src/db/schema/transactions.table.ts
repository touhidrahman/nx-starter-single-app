import { relations } from 'drizzle-orm'
import { boolean, decimal, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { balanceTransfersTable } from './balance-transfers.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { subcategoriesTable } from './subcategories.table'
import { transactionSchedulesTable } from './transaction-schedules.table'
import { usersTable } from './users.table'

export const transactionsTable = pgTable('transactions', {
    id: text().primaryKey().$defaultFn(generateId),
    accountId: text()
        .notNull()
        .references(() => accountsTable.id, { onDelete: 'set null' }),
    amount: decimal().notNull(),
    title: text(),
    note: text(),
    isOutgoing: boolean().notNull().default(true),
    categoryId: text().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    subcategoryId: text().references(() => subcategoriesTable.id, {
        onDelete: 'set null',
    }),
    committedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    groupId: text()
        .notNull()
        .references(() => groupsTable.id, { onDelete: 'cascade' }),
    scheduledTransactionId: text().references(
        () => transactionSchedulesTable.id,
        {
            onDelete: 'set null',
        },
    ),
    ...timestampColumns,
})

export const transactionsRelations = relations(
    transactionsTable,
    ({ one }) => ({
        account: one(accountsTable, {
            fields: [transactionsTable.accountId],
            references: [accountsTable.id],
        }),
        inBalanceTransfer: one(balanceTransfersTable, {
            fields: [transactionsTable.id],
            references: [balanceTransfersTable.inTransactionId],
        }),
        outBalanceTransfer: one(balanceTransfersTable, {
            fields: [transactionsTable.id],
            references: [balanceTransfersTable.outTransactionId],
        }),
        category: one(categoriesTable, {
            fields: [transactionsTable.categoryId],
            references: [categoriesTable.id],
        }),
        subcategory: one(subcategoriesTable, {
            fields: [transactionsTable.subcategoryId],
            references: [subcategoriesTable.id],
        }),
        creator: one(usersTable, {
            fields: [transactionsTable.creatorId],
            references: [usersTable.id],
        }),
        group: one(groupsTable, {
            fields: [transactionsTable.groupId],
            references: [groupsTable.id],
        }),
        scheduledTransaction: one(transactionSchedulesTable, {
            fields: [transactionsTable.scheduledTransactionId],
            references: [transactionSchedulesTable.id],
        }),
    }),
)
