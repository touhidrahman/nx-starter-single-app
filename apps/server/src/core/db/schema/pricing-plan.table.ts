import { relations } from 'drizzle-orm'
import {
    bigint,
    boolean,
    date,
    integer,
    pgTable,
    text,
} from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
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
    currency: text().default('USD'),
    isActive: boolean().default(true),
    isStarterPlan: boolean().default(false),
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
