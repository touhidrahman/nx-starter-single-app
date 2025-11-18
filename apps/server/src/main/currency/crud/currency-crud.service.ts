import { db } from '../../../db/db'
import { currenciesTable } from '../../../db/schema'
import { InsertCurrency, SelectCurrency } from '../core/currency-core.model'
import { CurrencyCoreService } from '../core/currency-core.service'
import { DEFAULT_CURRENCIES } from '../currency.values'

export class CurrencyCrudService extends CurrencyCoreService {
    static async seed(): Promise<void> {
        const data: InsertCurrency[] = DEFAULT_CURRENCIES
        for (const item of data) {
            const exists = await CurrencyCrudService.exists(item.id)
            if (!exists) {
                await db.insert(currenciesTable).values(item)
            }
        }
    }

    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectCurrency | null> {
        return CurrencyCrudService.findOne({ id, groupId })
    }
}
