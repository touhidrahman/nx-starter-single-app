import { SelectInvite } from '../core/invite-core.model'
import { InviteCoreService } from '../core/invite-core.service'

export class InviteCrudService extends InviteCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectInvite | null> {
        const existing = await InviteCrudService.findById(id)
        if (!existing || existing.groupId !== groupId) return null
        return existing
    }
}
