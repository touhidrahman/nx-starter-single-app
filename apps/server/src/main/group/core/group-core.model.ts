import { z } from 'zod'
import { groupsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertGroup = z.infer<typeof zInsertGroup>
export type SelectGroup = z.infer<typeof zSelectGroup>
export type UpdateGroup = z.infer<typeof zUpdateGroup>
export type QueryGroups = z.infer<typeof zQueryGroups>

export const zInsertGroup = createInsertSchema(groupsTable)
export const zSelectGroup = createSelectSchema(groupsTable)
export const zUpdateGroup = createUpdateSchema(groupsTable)
export const zQueryGroups = zInsertGroup.extend(zSearch.shape).extend(zPagination.shape).partial()
