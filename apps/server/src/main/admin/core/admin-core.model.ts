import { z } from 'zod'
import { adminsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertAdmin = z.infer<typeof zInsertAdmin>
export type SelectAdmin = z.infer<typeof zSelectAdmin>
export type UpdateAdmin = z.infer<typeof zUpdateAdmin>
export type QueryAdmins = z.infer<typeof zQueryAdmins>

export const zInsertAdmin = createInsertSchema(adminsTable)
export const zSelectAdmin = createSelectSchema(adminsTable)
export const zUpdateAdmin = createUpdateSchema(adminsTable)
export const zQueryAdmins = zInsertAdmin.extend(zSearch.shape).extend(zPagination.shape).partial()
