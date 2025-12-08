import { FORBIDDEN } from 'stoker/http-status-codes'
import {
    InsertTransactionSchedule,
    QueryTransactionSchedules,
    SelectTransactionSchedule,
} from './transaction-schedule.model'
import { TransactionScheduleCoreService } from './transaction-schedule-core.service'

export class TransactionScheduleService extends TransactionScheduleCoreService {
    static async findMany(
        filters: QueryTransactionSchedules,
    ): Promise<SelectTransactionSchedule[]> {
        if (!filters.groupId) {
            throw new Error('GroupId is required', { cause: FORBIDDEN })
        }
        return TransactionScheduleCoreService.findMany(filters)
    }

    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectTransactionSchedule | null> {
        return TransactionScheduleService.findOne({ id, groupId })
    }
}
