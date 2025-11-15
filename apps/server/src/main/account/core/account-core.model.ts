import { z } from 'zod'
import { accountsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../../utils/zod.util'

export type InsertAccount = z.infer<typeof zInsertAccount>
export type SelectAccount = z.infer<typeof zSelectAccount>
export type UpdateAccount = z.infer<typeof zUpdateAccount>
export type QueryAccounts = z.infer<typeof zQueryAccounts>

export const zInsertAccount = createInsertSchema(accountsTable)
export const zSelectAccount = createSelectSchema(accountsTable)
export const zUpdateAccount = createUpdateSchema(accountsTable)
export const zQueryAccounts = zInsertAccount
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
