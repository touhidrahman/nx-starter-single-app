import { desc, eq } from 'drizzle-orm'
import { NOT_FOUND } from 'stoker/http-status-codes'
import { db } from '../../db/db'
import { accountsTable, transactionsTable } from '../../db/schema'
import { SelectAccount } from '../account/core/account-core.model'
import { AccountCustomService } from '../account/custom/account-custom.service'
import { InsertTransaction, SelectTransaction, UpdateTransaction } from './transaction.model'
import { withSign } from './transaction.util'
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

        const additionAmount = withSign(input.amount)
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

    static async updateTransactionAndAccountBalance(
        transactionId: string,
        input: UpdateTransaction,
    ): Promise<SelectTransaction & { account: SelectAccount | null }> {
        const existingTransaction = await TransactionService.findById(transactionId)

        if (!existingTransaction) {
            throw new Error('Transaction not found', { cause: NOT_FOUND })
        }

        const account = await AccountCustomService.findByIdAndGroupId(
            existingTransaction.accountId,
            input.groupId || existingTransaction.groupId,
        )

        if (!account) {
            // just update the transaction if account not found
            const [updatedTransaction] = await db
                .update(transactionsTable)
                .set(input)
                .where(eq(transactionsTable.id, transactionId))
                .returning()

            return {
                ...updatedTransaction,
                account: null,
            }
        }

        // Revert the old transaction amount
        const prevAmount = withSign(existingTransaction.amount)
        const newAmount = withSign(input.amount)
        const updatedBalance = withSign(account.balance) - prevAmount + newAmount

        const updatedTransaction = await db.transaction(async (tx) => {
            await tx
                .update(accountsTable)
                .set({
                    balance: `${updatedBalance}`,
                })
                .where(eq(accountsTable.id, account.id))

            const [transaction] = await tx
                .update(transactionsTable)
                .set(input)
                .where(eq(transactionsTable.id, transactionId))
                .returning()

            return transaction
        })

        return {
            ...updatedTransaction,
            account: { ...account, balance: `${updatedBalance}` },
        }
    }

    static async deleteTransactionAndUpdateAccountBalance(transactionId: string): Promise<void> {
        const existingTransaction = await TransactionService.findById(transactionId)

        if (!existingTransaction) {
            throw new Error('Transaction not found', { cause: NOT_FOUND })
        }

        const account = await AccountCustomService.findByIdAndGroupId(
            existingTransaction.accountId,
            existingTransaction.groupId,
        )

        if (!account) {
            // just delete the transaction if account not found
            await db.delete(transactionsTable).where(eq(transactionsTable.id, transactionId))
            return
        }

        // Revert the transaction amount
        const prevAmount = withSign(existingTransaction.amount)
        const updatedBalance = Number(account.balance) - prevAmount

        await db.transaction(async (tx) => {
            await tx
                .update(accountsTable)
                .set({
                    balance: `${updatedBalance}`,
                })
                .where(eq(accountsTable.id, account.id))

            await tx.delete(transactionsTable).where(eq(transactionsTable.id, transactionId))
        })
    }
}
