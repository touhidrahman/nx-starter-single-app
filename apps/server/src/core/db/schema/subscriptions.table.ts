import { relations } from 'drizzle-orm'
import {
    boolean,
    date,
    integer,
    pgTable,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { groupsTable } from './groups.table'
import { pricingPlanTable } from './pricing-plan.table'

export const subscriptionsTable = pgTable('subscriptions', {
    id: text().primaryKey().$defaultFn(generateId),
    groupId: text()
        .references(() => groupsTable.id, { onDelete: 'cascade' })
        .notNull(),
    planId: text()
        .references(() => pricingPlanTable.id)
        .notNull(),
    startDate: timestamp({ withTimezone: true }),
    endDate: timestamp({ withTimezone: true }),
    isTrial: boolean().notNull().default(false),
    autoRenewal: boolean().notNull().default(false),
    paymentMethod: text(),
    transactionId: text(),
    usedStorage: integer().notNull().default(0),
    approveDate: date(),
    billingIntervalMonths: integer().notNull().default(1),
    ...timestampColumns,
})

export const subscriptionsRelations = relations(
    subscriptionsTable,
    ({ one }) => ({
        group: one(groupsTable, {
            fields: [subscriptionsTable.groupId],
            references: [groupsTable.id],
        }),
        plan: one(pricingPlanTable, {
            fields: [subscriptionsTable.planId],
            references: [pricingPlanTable.id],
        }),
    }),
)
