import { SelectAccount } from '../base/account-base.model'
import { AccountBaseService } from '../base/account-base.service'

export class AccountCommonService extends AccountBaseService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectAccount | null> {
        return AccountCommonService.findOne({ id, groupId })
    }
}
