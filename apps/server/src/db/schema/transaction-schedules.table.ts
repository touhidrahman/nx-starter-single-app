import { boolean, decimal, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { occuranceFrequencyEnum, timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { subcategoriesTable } from './subcategories.table'
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
    categoryId: text().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    subcategoryId: text().references(() => subcategoriesTable.id, {
        onDelete: 'set null',
    }),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    groupId: text()
        .notNull()
        .references(() => groupsTable.id, { onDelete: 'cascade' }),
    occuranceFrequency: occuranceFrequencyEnum().notNull(),
    onDayOfWeek: integer(),
    onDayOfMonth: integer(),
    onMonthOfYear: integer(),
    nextOccurrenceAt: timestamp({ withTimezone: true }).notNull(),
    stopOccurrenceAt: timestamp({ withTimezone: true }),
    occurrencesTotal: integer().notNull().default(-1), // -1 = forever
    occurrencesDone: integer().notNull().default(0),
    ...timestampColumns,
})
