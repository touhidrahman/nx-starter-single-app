import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { categoriesTable } from './categories.table'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const subcategoriesTable = pgTable('subcategories', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    icon: text(),
    color: text(),
    sortOrder: integer().notNull().default(0),
    groupId: text().references(() => groupsTable.id, { onDelete: 'set null' }),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    categoryId: text().references(() => categoriesTable.id, {
        onDelete: 'cascade',
    }),
})
