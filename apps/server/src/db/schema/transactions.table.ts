import { boolean, decimal, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
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
    transactionScheduleId: text().references(() => transactionSchedulesTable.id, {
        onDelete: 'set null',
    }),
    ...timestampColumns,
})
