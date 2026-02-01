import { index, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { groupsTable } from './groups.table'
import { rolesTable } from './roles.table'
import { usersTable } from './users.table'

export const membershipsTable = pgTable(
    'memberships',
    {
        userId: text()
            .notNull()
            .references(() => usersTable.id, { onDelete: 'cascade' }),
        groupId: text()
            .notNull()
            .references(() => groupsTable.id, { onDelete: 'cascade' }),
        roleId: text().references(() => rolesTable.id, {
            onDelete: 'restrict',
        }),
    },
    (table) => [
        // A user can be in a group with only one role. That's why we are making userId+groupId combo unique
        primaryKey({ columns: [table.userId, table.groupId] }),
        index('memberships_user_id_idx').on(table.userId),
        index('memberships_group_id_idx').on(table.groupId),
        index('memberships_role_id_idx').on(table.roleId),
        index('memberships_user_id_group_id_idx').on(table.userId, table.groupId),
    ],
)
