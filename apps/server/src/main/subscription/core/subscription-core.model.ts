import { z } from 'zod'
import { subscriptionsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertSubscription = z.infer<typeof zInsertSubscription>
export type SelectSubscription = z.infer<typeof zSelectSubscription>
export type UpdateSubscription = z.infer<typeof zUpdateSubscription>
export type QuerySubscriptions = z.infer<typeof zQuerySubscriptions>

export const zInsertSubscription = createInsertSchema(subscriptionsTable)
// Override history jsonb field to accept any (drizzle returns unknown)
export const zSelectSubscription = createSelectSchema(subscriptionsTable).extend({
    history: z.any(),
})
export const zUpdateSubscription = createUpdateSchema(subscriptionsTable)

export const zQuerySubscriptions = zInsertSubscription
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
