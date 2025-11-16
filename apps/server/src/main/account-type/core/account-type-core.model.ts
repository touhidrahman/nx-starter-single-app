import { z } from 'zod'
import { accountTypesTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../../utils/zod.util'

export type InsertAccountType = z.infer<typeof zInsertAccountType>
export type SelectAccountType = z.infer<typeof zSelectAccountType>
export type UpdateAccountType = z.infer<typeof zUpdateAccountType>
export type QueryAccountTypes = z.infer<typeof zQueryAccountTypes>

export const zInsertAccountType = createInsertSchema(accountTypesTable)
export const zSelectAccountType = createSelectSchema(accountTypesTable)
export const zUpdateAccountType = createUpdateSchema(accountTypesTable)
export const zQueryAccountTypes = zInsertAccountType
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
