import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { groupsTable } from '../../core/db/schema'

export type GroupDto = typeof groupsTable.$inferInsert
export type Group = typeof groupsTable.$inferSelect

export const zInsertGroup = createInsertSchema(groupsTable, {
    // email: (schema) => schema.email(),
    email: z.string().email().optional(),
    verifiedOn: z.coerce.date().optional(),
    ownerId: z.string().optional(),
})
export const zSelectGroup = createSelectSchema(groupsTable).partial()
export const zUpdateGroup = zInsertGroup.omit({
    // public facing API cannot update these fields
    verified: true,
    verifiedOn: true,
})

export const zUpdateUserRole = z.object({
    userId: z.string(),
    roleId: z.string(),
})
export const zUpdateGroupStatus = z.object({
    status: z.enum(['pending', 'active', 'inactive']),
})

export const zAddGroupByInvite = z.object({
    groupId: z.string(),
    userId: z.string(),
    roleId: z.string(),
})

export const zSwitchGroup = z.object({
    groupId: z.string(),
})
export type groupStatus = z.infer<typeof zUpdateGroupStatus>
