import { z } from 'zod'
import { transactionSchedulesTable } from '../../db/schema'
import { zPagination, zSearch } from '../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../utils/zod.util'

export type InsertTransactionSchedule = z.infer<
    typeof zInsertTransactionSchedule
>
export type SelectTransactionSchedule = z.infer<
    typeof zSelectTransactionSchedule
>
export type UpdateTransactionSchedule = z.infer<
    typeof zUpdateTransactionSchedule
>
export type QueryTransactionSchedules = z.infer<
    typeof zQueryTransactionSchedules
>

export const zInsertTransactionSchedule = createInsertSchema(
    transactionSchedulesTable,
)
export const zSelectTransactionSchedule = createSelectSchema(
    transactionSchedulesTable,
)
export const zUpdateTransactionSchedule = createUpdateSchema(
    transactionSchedulesTable,
)
export const zQueryTransactionSchedules = zInsertTransactionSchedule
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
