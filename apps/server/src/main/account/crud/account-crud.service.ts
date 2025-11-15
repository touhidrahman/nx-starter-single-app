import { SelectAccount } from '../core/account-core.model'
import { AccountCoreService } from '../core/account-core.service'

export class AccountCrudService extends AccountCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectAccount | null> {
        return AccountCrudService.findOne({ id, groupId })
    }
}
