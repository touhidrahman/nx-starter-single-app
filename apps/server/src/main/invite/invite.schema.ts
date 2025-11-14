import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { invitesTable } from '../../db/schema'

export type InviteDto = z.infer<typeof zInsertInvite>
export type Invite = z.infer<typeof zSelectInvite>

export const zInsertInvite = createInsertSchema(invitesTable)
export const zSelectInvite = createSelectSchema(invitesTable)

export type GroupLimitResult = {
    canAdd: boolean
    currentUsers: number
    maxUsers: number
    message?: string
    planName?: string
}
