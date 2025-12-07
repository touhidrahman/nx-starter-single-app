import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { accountsTable } from './accounts.table'

export const accountTypesTable = pgTable('account_types', {
    id: text().primaryKey(), // No default function here; IDs are generated manually
    name: text().notNull(),
    sortOrder: integer().notNull().default(0),
})

export const accountTypeRelations = relations(accountTypesTable, ({ many }) => ({
    accounts: many(accountsTable),
}))
