import { z } from 'zod'
import { currenciesTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from '../../../utils/zod.util'

export type InsertCurrency = z.infer<typeof zInsertCurrency>
export type SelectCurrency = z.infer<typeof zSelectCurrency>
export type UpdateCurrency = z.infer<typeof zUpdateCurrency>
export type QueryCurrencies = z.infer<typeof zQueryCurrencies>

export const zInsertCurrency = createInsertSchema(currenciesTable)
export const zSelectCurrency = createSelectSchema(currenciesTable)
export const zUpdateCurrency = createUpdateSchema(currenciesTable)
export const zQueryCurrencies = zInsertCurrency
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
