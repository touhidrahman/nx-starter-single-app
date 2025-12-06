import { FORBIDDEN } from 'stoker/http-status-codes'
import {
    InsertCategory,
    QueryCategories,
    SelectCategory,
} from './category.model'
import { CategoryCoreService } from './category-core.service'

export class CategoryService extends CategoryCoreService {
    static async findMany(filters: QueryCategories): Promise<SelectCategory[]> {
        if (!filters.groupId) {
            throw new Error('GroupId is required', { cause: FORBIDDEN })
        }
        return CategoryCoreService.findMany(filters)
    }

    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectCategory | null> {
        return CategoryService.findOne({ id, groupId })
    }
}
