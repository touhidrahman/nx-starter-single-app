import { z } from 'zod'
import { invitesTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertInvite = z.infer<typeof zInsertInvite>
export type SelectInvite = z.infer<typeof zSelectInvite>
export type UpdateInvite = z.infer<typeof zUpdateInvite>
export type QueryInvites = z.infer<typeof zQueryInvites>

export const zInsertInvite = createInsertSchema(invitesTable)
export const zSelectInvite = createSelectSchema(invitesTable)
export const zUpdateInvite = createUpdateSchema(invitesTable)
export const zQueryInvites = zInsertInvite.extend(zSearch.shape).extend(zPagination.shape).partial()
