import { z } from 'zod'
import { subcategoriesTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../../utils/zod.util'

export type InsertSubcategory = z.infer<typeof zInsertSubcategory>
export type SelectSubcategory = z.infer<typeof zSelectSubcategory>
export type UpdateSubcategory = z.infer<typeof zUpdateSubcategory>
export type QuerySubcategories = z.infer<typeof zQuerySubcategories>

export const zInsertSubcategory = createInsertSchema(subcategoriesTable)
export const zSelectSubcategory = createSelectSchema(subcategoriesTable)
export const zUpdateSubcategory = createUpdateSchema(subcategoriesTable)
export const zQuerySubcategories = zInsertSubcategory
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
