import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { adminsTable } from '../../core/db/schema'

export type InsertAdmin = typeof adminsTable.$inferInsert
export type SelectAdmin = typeof adminsTable.$inferSelect

export const zInsertAdmin = createInsertSchema(adminsTable)
export const zSelectAdmin = createSelectSchema(adminsTable)
export const zSelectAdminWithoutPassword = zSelectAdmin.omit({
    password: true,
})

export const zUpdateAdmin = zSelectAdmin
    .omit({
        email: true,
    })
    .partial()

export const zSearchAdmin = zSelectAdmin
    .pick({
        id: true,
        email: true,
        name: true,
    })
    .extend({
        page: z.number().int().positive().optional(),
        size: z.number().int().positive().optional(),
        search: z.string().optional(),
    })
    .partial()
