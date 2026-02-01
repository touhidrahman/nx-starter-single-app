import { decimal, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { transactionsTable } from './transactions.table'
import { usersTable } from './users.table'

export const balanceTransfersTable = pgTable(
    'balance_transfers',
    {
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
    },
    (table) => [
        index('balance_transfers_creator_id_idx').on(table.creatorId),
        index('balance_transfers_group_id_idx').on(table.groupId),
        index('balance_transfers_from_account_id_idx').on(table.fromAccountId),
        index('balance_transfers_to_account_id_idx').on(table.toAccountId),
        index('balance_transfers_category_id_idx').on(table.categoryId),
        index('balance_transfers_subcategory_id_idx').on(table.subcategoryId),
    ],
)
