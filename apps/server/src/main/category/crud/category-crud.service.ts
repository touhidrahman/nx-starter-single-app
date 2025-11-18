import { SelectCategory } from '../core/category-core.model'
import { CategoryCoreService } from '../core/category-core.service'

export class CategoryCrudService extends CategoryCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectCategory | null> {
        return CategoryCrudService.findOne({ id, groupId })
    }
}
