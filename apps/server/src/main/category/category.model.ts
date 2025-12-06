import { z } from 'zod'
import { categoriesTable } from '../../db/schema'
import { zPagination, zSearch } from '../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../utils/zod.util'

export type InsertCategory = z.infer<typeof zInsertCategory>
export type SelectCategory = z.infer<typeof zSelectCategory>
export type UpdateCategory = z.infer<typeof zUpdateCategory>
export type QueryCategories = z.infer<typeof zQueryCategories>

export const zInsertCategory = createInsertSchema(categoriesTable)
export const zSelectCategory = createSelectSchema(categoriesTable)
export const zUpdateCategory = createUpdateSchema(categoriesTable)
export const zQueryCategories = zInsertCategory
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
