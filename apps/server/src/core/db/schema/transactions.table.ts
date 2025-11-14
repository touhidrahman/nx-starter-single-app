import { relations } from 'drizzle-orm'
import {
    boolean,
    decimal,
    integer,
    pgTable,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
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
    categoryId: integer().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    subcategoryId: integer().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    committedAt: timestamp({ withTimezone: true }).notNull(),
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
    ({ one, many }) => ({
        account: one(accountsTable, {
            fields: [transactionsTable.accountId],
            references: [accountsTable.id],
        }),
        category: one(categoriesTable, {
            fields: [transactionsTable.categoryId],
            references: [categoriesTable.id],
        }),
        creator: one(usersTable, {
            fields: [transactionsTable.creatorId],
            references: [usersTable.id],
        }),
        group: one(groupsTable, {
            fields: [transactionsTable.groupId],
            references: [groupsTable.id],
        }),
        subcategory: one(categoriesTable, {
            fields: [transactionsTable.subcategoryId],
            references: [categoriesTable.id],
        }),
        scheduledTransaction: one(transactionSchedulesTable, {
            fields: [transactionsTable.scheduledTransactionId],
            references: [transactionSchedulesTable.id],
        }),
    }),
)
