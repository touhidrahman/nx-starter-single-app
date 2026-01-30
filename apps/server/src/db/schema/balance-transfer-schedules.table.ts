import { decimal, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const balanceTransferSchedulesTable = pgTable('balance_transfer_schedules', {
    id: text().primaryKey().$defaultFn(generateId),
    fromAccountId: text()
        .notNull()
        .references(() => accountsTable.id, { onDelete: 'set null' }),
    toAccountId: text()
        .notNull()
        .references(() => accountsTable.id, { onDelete: 'set null' }),
    amount: decimal().notNull(),
    title: text(),
    note: text(),
    categoryId: text().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    subcategoryId: text().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    creatorId: text().references(() => usersTable.id, {
        onDelete: 'set null',
    }),
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
