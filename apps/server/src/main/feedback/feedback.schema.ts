import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { feedbackTable } from '../../db/schema'

export type InsertFeedback = typeof feedbackTable.$inferInsert
export type SelectFeedback = typeof feedbackTable.$inferSelect
const feedbackTypes = ['feature', 'general', 'testimonial', 'issue'] as const

export const zInsertFeedback = createInsertSchema(feedbackTable)

export const zSelectFeedback = createSelectSchema(feedbackTable).partial()

export const zUpdateFeedback = zInsertFeedback.partial()
export type FeedbackType = (typeof feedbackTypes)[number]
