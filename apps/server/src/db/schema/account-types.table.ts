import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const accountTypesTable = pgTable('account_types', {
    id: text().primaryKey(), // No default function here; IDs are generated manually
    name: text().notNull(),
    sortOrder: integer().notNull().default(0),
})
