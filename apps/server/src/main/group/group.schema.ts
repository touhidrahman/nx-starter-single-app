import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { groupsTable } from '../../core/db/schema'

export type InsertGroup = z.infer<typeof zInsertGroup>
export type SelectGroup = z.infer<typeof zSelectGroup>

export const zInsertGroup = createInsertSchema(groupsTable, {
    email: z.string().email().optional(),
    verifiedOn: z.coerce.date().optional(),
    creatorId: z.string().optional(),
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
