import { SelectSubcategory } from '../core/subcategory-core.model'
import { SubcategoryCoreService } from '../core/subcategory-core.service'

export class SubcategoryCrudService extends SubcategoryCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectSubcategory | null> {
        return SubcategoryCrudService.findOne({ id, groupId })
    }
}
