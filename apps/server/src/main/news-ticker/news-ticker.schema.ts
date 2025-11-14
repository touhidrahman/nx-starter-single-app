import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { newsTickersTable } from '../../db/schema'

export type InsertNewsTicker = typeof newsTickersTable.$inferInsert
export type SelectNewsTicker = typeof newsTickersTable.$inferSelect

export const zInsertNewsTicker = createInsertSchema(newsTickersTable)

export const zSelectNewsTicker = createSelectSchema(newsTickersTable).partial()

export const zUpdateNewsTicker = zInsertNewsTicker.partial() // Allow partial
