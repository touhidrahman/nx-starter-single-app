import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { groupStatusEnum, groupTypeEnum } from './_common.table'
import { invitesTable } from './invites.table'
import { rolesTable } from './roles.table'
import { subscriptionsTable } from './subscriptions.table'
import { usersTable } from './users.table'

export const groupsTable = pgTable('groups', {
    id: text().primaryKey().$defaultFn(generateId),
    type: groupTypeEnum().notNull(),
    status: groupStatusEnum().notNull().default('pending'),
    name: text().notNull(),
    email: text(),
    phone: text(),
    address: text(),
    city: text(),
    state: text(),
    country: text(),
    postCode: text(),
    ownerId: text().references(() => usersTable.id),
    verifiedOn: timestamp({ withTimezone: true }),
    subscriptionId: text(),
    ...timestampColumns,
})

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
    owner: one(usersTable, {
        fields: [groupsTable.ownerId],
        references: [usersTable.id],
    }),
    invites: many(invitesTable),
    roles: many(rolesTable),
    subscription: one(subscriptionsTable, {
        fields: [groupsTable.subscriptionId],
        references: [subscriptionsTable.id],
    }),
}))
