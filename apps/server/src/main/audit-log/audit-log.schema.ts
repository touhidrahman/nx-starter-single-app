import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { auditLogTable } from '../../core/db/schema'

export type InsertLog = typeof auditLogTable.$inferInsert
export type SelectLog = typeof auditLogTable.$inferSelect

export const zInsertLog = createInsertSchema(auditLogTable).omit({
    creatorId: true,
})

export const zSelectLog = createSelectSchema(auditLogTable).partial()

export const zUpdateLog = zInsertLog.partial()
