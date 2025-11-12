import {
    AnyPgColumn,
    integer,
    pgTable,
    serial,
    text,
} from 'drizzle-orm/pg-core'
import { groupsTable } from './groups.table'

export const categoriesTable = pgTable('categories', {
    id: serial().primaryKey(),
    name: text().notNull(),
    icon: text(),
    color: text(),
    sortOrder: integer().notNull().default(0),
    groupId: text().references(() => groupsTable.id, { onDelete: 'set null' }),
    parentId: integer().references((): AnyPgColumn => categoriesTable.id),
})
