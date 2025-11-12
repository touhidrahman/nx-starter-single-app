import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { groupsTable } from './groups.table'
import { rolesTable } from './roles.table'
import { usersTable } from './users.table'

export const membershipsTable = pgTable(
    'memberships',
    {
        userId: text()
            .notNull()
            .references(() => usersTable.id),
        groupId: text()
            .notNull()
            .references(() => groupsTable.id),
        roleId: text().references(() => rolesTable.id, {
            onDelete: 'set null',
        }),
    },
    (table) => [
        // A user can be in a group with only one role. That's why we are making userId+groupId combo unique
        primaryKey({ columns: [table.userId, table.groupId] }),
    ],
)
