import { SelectTransaction } from './transaction.model'
import { TransactionCoreService } from './transaction-core.service'

export class TransactionService extends TransactionCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectTransaction | null> {
        return TransactionService.findOne({ id, groupId })
    }
}
