import { relations } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'
import { pricingPlanTable } from './pricing-plan.table'
import { usersTable } from './users.table'

export const subscriptionsTable = pgTable('subscriptions', {
    id: text().primaryKey().$defaultFn(generateId),
    groupId: text()
        .references(() => groupsTable.id, { onDelete: 'cascade' })
        .notNull()
        .unique(), // A group can have only one active subscription at a time
    planId: text()
        .references(() => pricingPlanTable.id)
        .notNull(),
    creatorId: text().references(() => usersTable.id),
    startDate: timestamp({ withTimezone: true }).notNull(),
    endDate: timestamp({ withTimezone: true }),
    isTrial: boolean().notNull().default(false),
    autoRenewal: boolean().notNull().default(false),
    paymentMethod: text(),
    transactionId: text(),
    usedStorage: integer().notNull().default(0),
    approvedAt: timestamp({ withTimezone: true }),
    approverId: text().references(() => usersTable.id),
    billingIntervalMonths: integer().notNull().default(1),
    history: jsonb().notNull().default('{}'),
    ...timestampColumns,
})

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [subscriptionsTable.groupId],
        references: [groupsTable.id],
    }),
    plan: one(pricingPlanTable, {
        fields: [subscriptionsTable.planId],
        references: [pricingPlanTable.id],
    }),
    creator: one(usersTable, {
        fields: [subscriptionsTable.creatorId],
        references: [usersTable.id],
    }),
    approver: one(usersTable, {
        fields: [subscriptionsTable.approverId],
        references: [usersTable.id],
    }),
}))
