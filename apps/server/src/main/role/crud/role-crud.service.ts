import { SelectRole } from '../core/role-core.model'
import { RoleCoreService } from '../core/role-core.service'

export class RoleCrudService extends RoleCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectRole | null> {
        const existing = await RoleCrudService.findById(id)
        if (!existing || existing.groupId !== groupId) return null
        return existing
    }
}
