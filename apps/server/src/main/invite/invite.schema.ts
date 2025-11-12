import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { invitesTable } from '../../core/db/schema'

export type InviteDto = typeof invitesTable.$inferInsert
export type Invite = typeof invitesTable.$inferSelect

export const zInsertInvite = createInsertSchema(invitesTable)
export const zSelectInvite = createSelectSchema(invitesTable)

export const zCreateInvite = z.object({
    email: z.string().email(),
    groupId: z.string(),
    invitedBy: z.string(),
    roleId: z.string(),
})

export type GroupLimitResult = {
    canAdd: boolean
    currentUsers: number
    maxUsers: number
    message?: string
    planName?: string
}
