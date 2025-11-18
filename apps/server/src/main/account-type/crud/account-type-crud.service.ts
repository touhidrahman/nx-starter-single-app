import { db } from '../../../db/db'
import { accountTypesTable } from '../../../db/schema'
import { DEFAULT_ACCOUNT_TYPES } from '../account-type.values'
import { InsertAccountType } from '../core/account-type-core.model'
import { AccountTypeCoreService } from '../core/account-type-core.service'

export class AccountTypeCrudService extends AccountTypeCoreService {
    static async seed(): Promise<void> {
        const data: InsertAccountType[] = DEFAULT_ACCOUNT_TYPES
        for (const item of data) {
            const exists = await AccountTypeCrudService.exists(item.id)
            if (!exists) {
                await db.insert(accountTypesTable).values(item)
            }
        }
    }
}
