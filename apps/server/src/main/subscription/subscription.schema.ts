import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { subscriptionsTable } from '../../core/db/schema'
import { subscriptionsRequestTable } from '../../core/db/schema/subscriptions-request.table'

export type InsertSubscription = typeof subscriptionsTable.$inferInsert
export type SelectSubscription = typeof subscriptionsTable.$inferSelect
export type InsertSubscriptionRequest =
    typeof subscriptionsRequestTable.$inferInsert

export const zInsertSubscription = createInsertSchema(subscriptionsTable, {
    planId: (schema) => schema.min(1), //
}).omit({
    createdAt: true,
    updatedAt: true,
    id: true,
})
export const zInsertSubscriptionRequest = createInsertSchema(
    subscriptionsRequestTable,
    {
        planId: (schema) => schema.min(1), //
    },
).omit({
    createdAt: true,
    updatedAt: true,
    id: true,
})

export const zSelectSubscription = createSelectSchema(subscriptionsTable)
export const zSelectSubscriptionRequest = createSelectSchema(
    subscriptionsRequestTable,
)

export const zUpdateSubscription = zInsertSubscription.partial()
export const zUpdateSubscriptionRequests = zInsertSubscriptionRequest
    .partial()
    .extend({
        status: z.enum(['pending', 'approved']).optional(),
    })
export const zUpdateSubscriptionRequest = z.object({
    groupId: z.string(),
    id: z.string(),
})
