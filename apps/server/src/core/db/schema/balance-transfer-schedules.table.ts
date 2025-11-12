import { relations } from 'drizzle-orm'
import { decimal, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { accountsTable } from './accounts.table'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const balanceTransferSchedulesTable = pgTable(
    'balance_transfer_schedules',
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
        ...timestampColumns,
    },
)

export const balanceTransferSchedulesRelations = relations(
    balanceTransferSchedulesTable,
    ({ one, many }) => ({
        fromAccount: one(accountsTable, {
            fields: [balanceTransferSchedulesTable.fromAccountId],
            references: [accountsTable.id],
        }),
        toAccount: one(accountsTable, {
            fields: [balanceTransferSchedulesTable.toAccountId],
            references: [accountsTable.id],
        }),
        category: one(categoriesTable, {
            fields: [balanceTransferSchedulesTable.categoryId],
            references: [categoriesTable.id],
        }),
        creator: one(usersTable, {
            fields: [balanceTransferSchedulesTable.creatorId],
            references: [usersTable.id],
        }),
        group: one(groupsTable, {
            fields: [balanceTransferSchedulesTable.groupId],
            references: [groupsTable.id],
        }),
        subcategory: one(categoriesTable, {
            fields: [balanceTransferSchedulesTable.subcategoryId],
            references: [categoriesTable.id],
        }),
    }),
)
