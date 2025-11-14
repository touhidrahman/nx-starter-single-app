import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { accountsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'

export type InsertAccount = z.infer<typeof zInsertAccount>
export type SelectAccount = z.infer<typeof zSelectAccount>
export type UpdateAccount = z.infer<typeof zUpdateAccount>
export type QueryAccounts = z.infer<typeof zQueryAccounts>

export const zInsertAccount = createInsertSchema(accountsTable)
export const zSelectAccount = createSelectSchema(accountsTable)
export const zUpdateAccount = zInsertAccount.partial()
export const zQueryAccounts = zInsertAccount
    .partial()
    .extend(zSearch.shape)
    .extend(zPagination.shape)
