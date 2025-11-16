import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'

export const accountTypesTable = pgTable('account_types', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    sortOrder: integer().notNull().default(0),
})
