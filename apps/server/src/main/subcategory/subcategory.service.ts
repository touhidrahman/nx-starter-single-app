import { FORBIDDEN } from 'stoker/http-status-codes'
import { InsertSubcategory, QuerySubcategories, SelectSubcategory } from './subcategory.model'
import { SubcategoryCoreService } from './subcategory-core.service'

export class SubcategoryService extends SubcategoryCoreService {
    static async findMany(filters: QuerySubcategories): Promise<SelectSubcategory[]> {
        if (!filters.groupId) {
            throw new Error('GroupId is required', { cause: FORBIDDEN })
        }
        return SubcategoryCoreService.findMany(filters)
    }

    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectSubcategory | null> {
        return SubcategoryService.findOne({ id, groupId })
    }
}
