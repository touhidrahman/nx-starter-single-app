import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { groupsTable } from './groups.table'
import { rolesTable } from './roles.table'
import { usersTable } from './users.table'

export const invitesTable = pgTable('invites', {
    id: text().primaryKey().$defaultFn(generateId),
    email: text().notNull(),
    groupId: text()
        .references(() => groupsTable.id, { onDelete: 'cascade' })
        .notNull(),
    roleId: text().references(() => rolesTable.id, { onDelete: 'set null' }),
    invitedBy: text()
        .references(() => usersTable.id, { onDelete: 'cascade' })
        .notNull(),
    invitedOn: timestamp({ withTimezone: true }).notNull().defaultNow(),
    acceptedOn: timestamp({ withTimezone: true }),
})

export const invitesRelations = relations(invitesTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [invitesTable.groupId],
        references: [groupsTable.id],
    }),
    invitedBy: one(usersTable, {
        fields: [invitesTable.invitedBy],
        references: [usersTable.id],
    }),
}))
