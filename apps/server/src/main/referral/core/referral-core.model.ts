import { z } from 'zod'
import { referralsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertReferral = z.infer<typeof zInsertReferral>
export type SelectReferral = z.infer<typeof zSelectReferral>
export type UpdateReferral = z.infer<typeof zUpdateReferral>
export type QueryReferrals = z.infer<typeof zQueryReferrals>

export const zInsertReferral = createInsertSchema(referralsTable)
export const zSelectReferral = createSelectSchema(referralsTable)
export const zUpdateReferral = createUpdateSchema(referralsTable)
export const zQueryReferrals = zInsertReferral
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
