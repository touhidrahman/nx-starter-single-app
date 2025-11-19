import { z } from 'zod'
import { rolesTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../../utils/zod.util'

export type InsertRole = z.infer<typeof zInsertRole>
export type SelectRole = z.infer<typeof zSelectRole>
export type UpdateRole = z.infer<typeof zUpdateRole>
export type QueryRoles = z.infer<typeof zQueryRoles>

export const zInsertRole = createInsertSchema(rolesTable)
export const zSelectRole = createSelectSchema(rolesTable)
export const zUpdateRole = createUpdateSchema(rolesTable)
export const zQueryRoles = zInsertRole
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
