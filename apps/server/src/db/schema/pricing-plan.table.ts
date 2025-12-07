import { relations } from 'drizzle-orm'
import { bigint, boolean, date, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '../id.util'
import { timestampColumns } from './_common.table'
import { subscriptionsTable } from './subscriptions.table'

export const pricingPlanTable = pgTable('pricing_plan', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    description: text(),
    monthlyPrice: integer().notNull(),
    yearlyPrice: integer().notNull(),
    discountPrice: integer(),
    discountPeriodStart: date(),
    discountPeriodEnd: date(),
    currency: text().notNull().default('USD'),
    isActive: boolean().notNull().default(false),
    storageLimit: bigint({ mode: 'number' }).notNull(),
    maxUsers: integer().notNull(),
    activeFeatures: text().array(),
    inactiveFeatures: text().array(),
    trialPeriodDays: integer(),
    ...timestampColumns,
})

export const pricingPlanRelations = relations(pricingPlanTable, ({ many }) => ({
    subscriptions: many(subscriptionsTable),
}))
