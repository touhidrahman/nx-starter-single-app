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
import { transactionsTable } from './transactions.table'
import { usersTable } from './users.table'

export const transactionSchedulesTable = pgTable('transaction_schedules', {
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
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    groupId: text()
        .notNull()
        .references(() => groupsTable.id, { onDelete: 'cascade' }),
    cronExpression: text().notNull(),
    nextOccurrenceAt: timestamp({ withTimezone: true }).notNull(),
    stopOccurrenceAt: timestamp({ withTimezone: true }),
    occurrencesTotal: integer(),
    occurrencesDone: integer().notNull().default(0),
    ...timestampColumns,
})

export const transactionScheduleRelations = relations(
    transactionSchedulesTable,
    ({ one, many }) => ({
        account: one(accountsTable, {
            fields: [transactionSchedulesTable.accountId],
            references: [accountsTable.id],
        }),
        category: one(categoriesTable, {
            fields: [transactionSchedulesTable.categoryId],
            references: [categoriesTable.id],
        }),
        creator: one(usersTable, {
            fields: [transactionSchedulesTable.creatorId],
            references: [usersTable.id],
        }),
        group: one(groupsTable, {
            fields: [transactionSchedulesTable.groupId],
            references: [groupsTable.id],
        }),
        subcategory: one(categoriesTable, {
            fields: [transactionSchedulesTable.subcategoryId],
            references: [categoriesTable.id],
        }),
        transactions: many(transactionsTable),
    }),
)
