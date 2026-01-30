import { decimal, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { transactionsTable } from './transactions.table'
import { usersTable } from './users.table'

export const balanceTransfersTable = pgTable('balance_transfers', {
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
    committedAt: timestamp({ withTimezone: true }).notNull(),
    outTransactionId: text().references(() => transactionsTable.id, {
        onDelete: 'set null',
    }),
    inTransactionId: text().references(() => transactionsTable.id, {
        onDelete: 'set null',
    }),
    categoryId: text().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    subcategoryId: text().references(() => categoriesTable.id, {
        onDelete: 'set null',
    }),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    groupId: text()
        .notNull()
        .references(() => groupsTable.id, { onDelete: 'cascade' }),
    ...timestampColumns,
})
