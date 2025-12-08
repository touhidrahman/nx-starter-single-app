import { z } from 'zod'
import { pricingPlanTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertPlan = z.infer<typeof zInsertPlan>
export type SelectPlan = z.infer<typeof zSelectPlan>
export type UpdatePlan = z.infer<typeof zUpdatePlan>
export type QueryPlans = z.infer<typeof zQueryPlans>

export const zInsertPlan = createInsertSchema(pricingPlanTable)
export const zSelectPlan = createSelectSchema(pricingPlanTable)
export const zUpdatePlan = createUpdateSchema(pricingPlanTable)
export const zQueryPlans = zInsertPlan.extend(zSearch.shape).extend(zPagination.shape).partial()
