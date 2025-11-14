import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const accountTypesTable = pgTable('account_types', {
    id: serial().primaryKey(),
    name: text().notNull(),
    sortOrder: integer().notNull().default(0),
})
