import { relations } from 'drizzle-orm'
import { boolean, date, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { groupsTable } from './groups.table'
import { pricingPlanTable } from './pricing-plan.table'

export const subscriptionsRequestTable = pgTable('subscription_requests', {
    id: text().primaryKey().$defaultFn(generateId),
    groupId: text()
        .references(() => groupsTable.id, { onDelete: 'cascade' })
        .notNull(),
    planId: text()
        .references(() => pricingPlanTable.id)
        .notNull(),
    isTrial: boolean().notNull().default(false),
    autoRenewal: boolean().notNull().default(false),
    paymentMethod: text(),
    transactionId: text(),
    approveDate: date(),
    billingIntervalMonths: integer().notNull().default(1),
    ...timestampColumns,
})

export const subscriptionsRequestRelations = relations(
    subscriptionsRequestTable,
    ({ one }) => ({
        group: one(groupsTable, {
            fields: [subscriptionsRequestTable.groupId],
            references: [groupsTable.id],
        }),
        plan: one(pricingPlanTable, {
            fields: [subscriptionsRequestTable.planId],
            references: [pricingPlanTable.id],
        }),
    }),
)
