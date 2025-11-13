import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { rolesTable } from '../../core/db/schema'

export type InsertRole = typeof rolesTable.$inferInsert
export type SelectRole = typeof rolesTable.$inferSelect

export const zInsertRole = createInsertSchema(rolesTable)
export const zSelectRole = createSelectSchema(rolesTable)
export const zUpdateRole = zInsertRole.partial()
