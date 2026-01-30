import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
    accountTypesTable: {
        accounts: r.many.accountsTable(),
    },
    accountsTable: {
        accountTypes: r.one.accountTypesTable({
            from: r.accountsTable.type,
            to: r.accountTypesTable.id,
        }),
        transactions: r.many.transactionsTable(),
        group: r.one.groupsTable({ from: r.accountsTable.groupId, to: r.groupsTable.id }),
        creator: r.one.usersTable({ from: r.accountsTable.creatorId, to: r.usersTable.id }),
    },
    balanceTransferSchedulesTable: {
        fromAccount: r.one.accountsTable({
            from: r.balanceTransferSchedulesTable.fromAccountId,
            to: r.accountsTable.id,
        }),
        toAccount: r.one.accountsTable({
            from: r.balanceTransferSchedulesTable.toAccountId,
            to: r.accountsTable.id,
        }),
        category: r.one.categoriesTable({
            from: r.balanceTransferSchedulesTable.categoryId,
            to: r.categoriesTable.id,
        }),
        creator: r.one.usersTable({
            from: r.balanceTransferSchedulesTable.creatorId,
            to: r.usersTable.id,
        }),
        subcategory: r.one.subcategoriesTable({
            from: r.balanceTransferSchedulesTable.subcategoryId,
            to: r.subcategoriesTable.id,
        }),
        group: r.one.groupsTable({
            from: r.balanceTransferSchedulesTable.groupId,
            to: r.groupsTable.id,
        }),
    },
    balanceTransfersTable: {
        fromAccount: r.one.accountsTable({
            from: r.balanceTransfersTable.fromAccountId,
            to: r.accountsTable.id,
        }),
        toAccount: r.one.accountsTable({
            from: r.balanceTransfersTable.toAccountId,
            to: r.accountsTable.id,
        }),
        category: r.one.categoriesTable({
            from: r.balanceTransfersTable.categoryId,
            to: r.categoriesTable.id,
        }),
        creator: r.one.usersTable({
            from: r.balanceTransfersTable.creatorId,
            to: r.usersTable.id,
        }),
        subcategory: r.one.subcategoriesTable({
            from: r.balanceTransfersTable.subcategoryId,
            to: r.subcategoriesTable.id,
        }),
        group: r.one.groupsTable({
            from: r.balanceTransfersTable.groupId,
            to: r.groupsTable.id,
        }),
        outTransaction: r.one.transactionsTable({
            from: r.balanceTransfersTable.outTransactionId,
            to: r.transactionsTable.id,
        }),
        inTransaction: r.one.transactionsTable({
            from: r.balanceTransfersTable.inTransactionId,
            to: r.transactionsTable.id,
        }),
    },
}))
