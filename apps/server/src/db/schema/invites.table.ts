import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { groupsTable } from './groups.table'
import { rolesTable } from './roles.table'
import { usersTable } from './users.table'

export const invitesTable = pgTable(
    'invites',
    {
        id: text().primaryKey().$defaultFn(generateId),
        email: text().notNull(),
        groupId: text()
            .references(() => groupsTable.id, { onDelete: 'cascade' })
            .notNull(),
        roleId: text().references(() => rolesTable.id, { onDelete: 'set null' }),
        inviterId: text()
            .references(() => usersTable.id, { onDelete: 'cascade' })
            .notNull(),
        invitedOn: timestamp({ withTimezone: true }).notNull().defaultNow(),
        acceptedOn: timestamp({ withTimezone: true }),
    },
    (table) => [
        index('invites_inviter_id_idx').on(table.inviterId),
        index('invites_group_id_idx').on(table.groupId),
        index('invites_role_id_idx').on(table.roleId),
    ],
)
