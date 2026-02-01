import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'

export const rolesTable = pgTable(
    'roles',
    {
        id: text().primaryKey().$defaultFn(generateId),
        name: text().notNull(),
        description: text(),
        groupId: text().references(() => groupsTable.id, { onDelete: 'cascade' }),
        permissions: text(),
        ...timestampColumns,
    },
    (table) => [index('roles_group_id_idx').on(table.groupId)],
)
