import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'
import { referralCodesTable, referralsTable } from '../../db/schema'

export type InsertReferralCode = typeof referralCodesTable.$inferInsert
export type SelectReferralCode = typeof referralCodesTable.$inferSelect

export const zGenerateReferralCode = createInsertSchema(referralCodesTable)

export const zSelectReferralCode =
    createSelectSchema(referralCodesTable).partial()

export const zSelectReferredUsers = createSelectSchema(referralsTable).partial()

export const zReferralPoints = z.object({
    totalPoints: z.number().nonnegative(),
})
