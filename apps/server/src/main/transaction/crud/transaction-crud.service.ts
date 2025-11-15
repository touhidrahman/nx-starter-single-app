import { SelectTransaction } from '../core/transaction-core.model'
import { TransactionCoreService } from '../core/transaction-core.service'

export class TransactionCrudService extends TransactionCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectTransaction | null> {
        return TransactionCrudService.findOne({ id, groupId })
    }
}
