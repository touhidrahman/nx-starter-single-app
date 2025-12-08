import { z } from 'zod'
import { transactionsTable } from '../../db/schema'
import { zPagination, zSearch } from '../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../utils/zod.util'

export type InsertTransaction = z.infer<typeof zInsertTransaction>
export type SelectTransaction = z.infer<typeof zSelectTransaction>
export type UpdateTransaction = z.infer<typeof zUpdateTransaction>
export type QueryTransactions = z.infer<typeof zQueryTransactions>

export const zInsertTransaction = createInsertSchema(transactionsTable)
export const zSelectTransaction = createSelectSchema(transactionsTable)
export const zUpdateTransaction = createUpdateSchema(transactionsTable)
export const zCustomQueryTransaction = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})
export const zQueryTransactions = zInsertTransaction
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .extend(zCustomQueryTransaction.shape)
    .partial()
