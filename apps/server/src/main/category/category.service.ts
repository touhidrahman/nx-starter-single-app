import { FORBIDDEN } from 'stoker/http-status-codes'
import { db } from '../../db/db'
import { QueryCategories, SelectCategory, SelectCategoryWithSubcategories } from './category.model'
import { CategoryCoreService } from './category-core.service'

export class CategoryService extends CategoryCoreService {
    static async findMany(filters: QueryCategories): Promise<SelectCategory[]> {
        if (!filters.groupId) {
            throw new Error('GroupId is required', { cause: FORBIDDEN })
        }
        return CategoryCoreService.findMany(filters)
    }

    static async findByIdAndGroupId(id: string, groupId: string): Promise<SelectCategory | null> {
        return CategoryService.findOne({ id, groupId })
    }

    static async findOneWithSubcategories(
        id: string,
        groupId: string,
    ): Promise<SelectCategoryWithSubcategories | null> {
        const category = await db.query.categoriesTable.findFirst({
            where: (categoriesTable, { eq, and }) =>
                and(eq(categoriesTable.id, id), eq(categoriesTable.groupId, groupId)),
            with: {
                subcategories: true,
            },
        })
        return category ?? null
    }
}
