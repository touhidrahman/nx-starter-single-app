import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { groupsTable } from './groups.table'
import { subcategoriesTable } from './subcategories.table'
import { usersTable } from './users.table'

export const categoriesTable = pgTable('categories', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    icon: text(),
    color: text(),
    sortOrder: integer().notNull().default(0),
    groupId: text().references(() => groupsTable.id, { onDelete: 'set null' }),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
})

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
    group: one(groupsTable, {
        fields: [categoriesTable.groupId],
        references: [groupsTable.id],
    }),
    creator: one(usersTable, {
        fields: [categoriesTable.creatorId],
        references: [usersTable.id],
    }),
    subcategories: many(subcategoriesTable),
}))
