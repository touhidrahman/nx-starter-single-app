import { desc, eq, sql } from 'drizzle-orm'
import { NOT_FOUND } from 'stoker/http-status-codes'
import { db } from '../../db/db'
import { accountsTable, transactionsTable } from '../../db/schema'
import { SelectAccount } from '../account/core/account-core.model'
import { AccountCustomService } from '../account/custom/account-custom.service'
import { InsertTransaction, SelectTransaction } from './transaction.model'
import { TransactionCoreService } from './transaction-core.service'

export class TransactionService extends TransactionCoreService {
    static async findByIdAndGroupId(
        id: string,
        groupId: string,
    ): Promise<SelectTransaction | null> {
        return TransactionService.findOne({ id, groupId })
    }

    static async createTransactionAndUpdateAccountBalance(
        input: InsertTransaction,
    ): Promise<SelectTransaction & { account: SelectAccount }> {
        const account = await AccountCustomService.findByIdAndGroupId(
            input.accountId,
            input.groupId,
        )

        if (!account) {
            throw new Error('Account not found in the specified organization', {
                cause: NOT_FOUND,
            })
        }

        const additionAmount =
            Number(input.amount) * (input.isOutgoing ? -1 : 1)
        const updatedBalance = Number(account.balance) + additionAmount
        const transaction = await db.transaction(async (tx) => {
            await tx
                .update(accountsTable)
                .set({
                    balance: `${updatedBalance}`,
                })
                .where(eq(accountsTable.id, account.id))

            await tx.insert(transactionsTable).values({ ...input })

            const [createdTransaction] = await tx
                .select()
                .from(transactionsTable)
                .where(eq(transactionsTable.accountId, input.accountId))
                .orderBy(desc(transactionsTable.createdAt))
                .limit(1)

            return createdTransaction
        })

        return {
            ...transaction,
            account: { ...account, balance: `${updatedBalance}` },
        }
    }
}
