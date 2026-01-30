import { decimal, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const currenciesTable = pgTable('currencies', {
    id: text().primaryKey(), // No default function here; IDs are generated manually eg - USD, EUR
    name: text().notNull(),
    sortOrder: integer().notNull().default(0),
    symbol: text().default('$'),
    conversionRateUSD: decimal().notNull().default('1.00'), // how 1 unit currency costs in USD
    groupId: text().references(() => groupsTable.id, { onDelete: 'cascade' }),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
})
