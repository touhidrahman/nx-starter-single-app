import { relations } from 'drizzle-orm'
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
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
    ],
)

export const membershipRelations = relations(membershipsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [membershipsTable.userId],
        references: [usersTable.id],
    }),
    group: one(groupsTable, {
        fields: [membershipsTable.groupId],
        references: [groupsTable.id],
    }),
    role: one(rolesTable, {
        fields: [membershipsTable.roleId],
        references: [rolesTable.id],
    }),
}))
