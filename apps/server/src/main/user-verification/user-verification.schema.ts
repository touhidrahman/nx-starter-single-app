import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { userVerificationTable } from '../../core/db/schema'

export type InsertUserVerification = typeof userVerificationTable.$inferInsert
export type SelectUserVerification = typeof userVerificationTable.$inferSelect
export const zInsertUserVerification = createInsertSchema(userVerificationTable)
export const zSelectUserVerification = createSelectSchema(
    userVerificationTable,
).partial()
export const zUpdateUserVerification = zInsertUserVerification.partial()

export const USER_VERIFICATION_TYPE_VALUES = {
    registration: 'registration',
    resetPassword: 'reset-password',
}
