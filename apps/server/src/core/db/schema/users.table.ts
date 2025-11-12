import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { lower } from '../orm.util'
import { groupsTable } from './groups.table'
import { invitesTable } from './invites.table'
import { referralsTable } from './referral.table'

export const usersTable = pgTable(
    'users',
    {
        id: text().primaryKey().$defaultFn(generateId),
        username: text().notNull().unique(),
        firstName: text().notNull(),
        lastName: text().notNull(),
        coverPhoto: text(),
        profilePhoto: text(),
        email: text(),
        password: text().notNull(),
        phone: text(),
        address: text(),
        city: text(),
        state: text(),
        country: text(),
        postCode: text(),
        url: text(),
        bio: text(),
        lastLogin: timestamp({ withTimezone: true }),
        bannedAt: timestamp({ withTimezone: true }),
        verifiedAt: timestamp({ withTimezone: true }),
        defaultGroupId: text().references(() => groupsTable.id, {
            onDelete: 'set null',
        }),
        ...timestampColumns,
    },
    (table) => [uniqueIndex('usernameUniqueIndex').on(lower(table.username))],
)

export const usersRelations = relations(usersTable, ({ one, many }) => ({
    invites: many(invitesTable),
    ownedGroups: many(groupsTable),
    defaultGroup: one(groupsTable, {
        fields: [usersTable.defaultGroupId],
        references: [groupsTable.id],
    }),
    referrals: many(referralsTable),
}))
