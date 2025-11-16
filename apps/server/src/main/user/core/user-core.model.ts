import { z } from 'zod'
import { usersTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../../utils/zod.util'

export type InsertUser = z.infer<typeof zInsertUser>
export type SelectUser = z.infer<typeof zSelectUser>
export type UpdateUser = z.infer<typeof zUpdateUser>
export type QueryUsers = z.infer<typeof zQueryUsers>

export const zInsertUser = createInsertSchema(usersTable)
export const zSelectUser = createSelectSchema(usersTable)
export const zUpdateUser = createUpdateSchema(usersTable)
export const zQueryUsers = zInsertUser
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
