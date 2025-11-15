import { SelectTransaction } from '../basic/transaction-basic.model'
import { TransactionBasicService } from '../basic/transaction-basic.service'

export class TransactionCommonService extends TransactionBasicService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectTransaction | null> {
        return TransactionCommonService.findOne({ id, groupId })
    }
}
