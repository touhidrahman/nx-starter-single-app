import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { currenciesTable } from './currencies.table'
import { invitesTable } from './invites.table'
import { membershipsTable } from './memberships.table'
import { rolesTable } from './roles.table'
import { subscriptionsTable } from './subscriptions.table'
import { transactionsTable } from './transactions.table'
import { usersTable } from './users.table'

export const groupsTable = pgTable('groups', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    email: text(),
    phone: text(),
    address1: text(),
    address2: text(),
    city: text(),
    state: text(),
    country: text(),
    zip: text(),
    creatorId: text().references(() => usersTable.id, { onDelete: 'set null' }),
    verifiedOn: timestamp({ withTimezone: true }),
    subscriptionId: text(),
    ...timestampColumns,
})

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
    creator: one(usersTable, {
        fields: [groupsTable.creatorId],
        references: [usersTable.id],
    }),
    invites: many(invitesTable),
    roles: many(rolesTable),
    subscription: one(subscriptionsTable, {
        fields: [groupsTable.subscriptionId],
        references: [subscriptionsTable.id],
    }),
    transactions: many(transactionsTable),
    memberships: many(membershipsTable),
    currencies: many(currenciesTable),
}))
