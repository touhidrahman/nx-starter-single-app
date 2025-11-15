import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { transactionsTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'

export type InsertTransaction = z.infer<typeof zInsertTransaction>
export type SelectTransaction = z.infer<typeof zSelectTransaction>
export type UpdateTransaction = z.infer<typeof zUpdateTransaction>
export type QueryTransactions = z.infer<typeof zQueryTransactions>

export const zInsertTransaction = createInsertSchema(transactionsTable)
export const zSelectTransaction = createSelectSchema(transactionsTable)
export const zUpdateTransaction = zInsertTransaction.partial()
export const zQueryTransactions = zInsertTransaction
    .partial()
    .extend(zSearch.shape)
    .extend(zPagination.shape)
