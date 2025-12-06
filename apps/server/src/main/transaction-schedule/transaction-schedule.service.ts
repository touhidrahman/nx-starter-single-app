import { SelectTransactionSchedule } from './transaction-schedule.model'
import { TransactionScheduleCoreService } from './transaction-schedule-core.service'

export class TransactionScheduleService extends TransactionScheduleCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectTransactionSchedule | null> {
        return TransactionScheduleService.findOne({ id, groupId })
    }
}
