import { index, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { groupsTable } from './groups.table'
import { usersTable } from './users.table'

export const categoriesTable = pgTable(
    'categories',
    {
        id: text().primaryKey().$defaultFn(generateId),
        name: text().notNull(),
        icon: text(),
        color: text(),
        sortOrder: integer().notNull().default(0),
        groupId: text().references(() => groupsTable.id, { onDelete: 'set null' }),
        creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    },
    (table) => [
        index('categories_creator_id_idx').on(table.creatorId),
        index('categories_group_id_idx').on(table.groupId),
    ],
)
