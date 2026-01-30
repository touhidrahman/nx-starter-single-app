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
    categoriesTable: {
        group: r.one.groupsTable({
            from: r.categoriesTable.groupId,
            to: r.groupsTable.id,
        }),
        creator: r.one.usersTable({
            from: r.categoriesTable.creatorId,
            to: r.usersTable.id,
        }),
        subcategories: r.many.subcategoriesTable(),
    },
    currenciesTable: {
        group: r.one.groupsTable({
            from: r.currenciesTable.groupId,
            to: r.groupsTable.id,
        }),
        creator: r.one.usersTable({
            from: r.currenciesTable.creatorId,
            to: r.usersTable.id,
        }),
    },
    groupsTable: {
        creator: r.one.usersTable({
            from: r.groupsTable.creatorId,
            to: r.usersTable.id,
        }),
        invites: r.many.invitesTable(),
        roles: r.many.rolesTable(),
        subscription: r.one.subscriptionsTable({
            from: r.groupsTable.subscriptionId,
            to: r.subscriptionsTable.id,
        }),
        transactions: r.many.transactionsTable(),
        memberships: r.many.membershipsTable(),
        currencies: r.many.currenciesTable(),
        categories: r.many.categoriesTable(),
        subcategories: r.many.subcategoriesTable(),
    },
    invitesTable: {
        group: r.one.groupsTable({
            from: r.invitesTable.groupId,
            to: r.groupsTable.id,
        }),
        invitedBy: r.one.usersTable({
            from: r.invitesTable.invitedBy,
            to: r.usersTable.id,
        }),
    },
    membershipsTable: {
        user: r.one.usersTable({
            from: r.membershipsTable.userId,
            to: r.usersTable.id,
        }),
        group: r.one.groupsTable({
            from: r.membershipsTable.groupId,
            to: r.groupsTable.id,
        }),
        role: r.one.rolesTable({
            from: r.membershipsTable.roleId,
            to: r.rolesTable.id,
        }),
    },
    pricingPlanTable: {
        subscriptions: r.many.subscriptionsTable(),
    },
    referralCodesTable: {
        user: r.one.usersTable({
            from: r.referralCodesTable.userId,
            to: r.usersTable.id,
        }),
        group: r.one.groupsTable({
            from: r.referralCodesTable.groupId,
            to: r.groupsTable.id,
        }),
        referrals: r.many.referralsTable(),
    },
    referralsTable: {
        referralCode: r.one.referralCodesTable({
            from: r.referralsTable.referralCodeId,
            to: r.referralCodesTable.id,
        }),
        referredUser: r.one.usersTable({
            from: r.referralsTable.referredId,
            to: r.usersTable.id,
        }),
    },
    rolesTable: {
        group: r.one.groupsTable({
            from: r.rolesTable.groupId,
            to: r.groupsTable.id,
        }),
        memberships: r.many.membershipsTable(),
    },
    subcategoriesTable: {
        category: r.one.categoriesTable({
            from: r.subcategoriesTable.categoryId,
            to: r.categoriesTable.id,
        }),
        creator: r.one.usersTable({
            from: r.subcategoriesTable.creatorId,
            to: r.usersTable.id,
        }),
        group: r.one.groupsTable({
            from: r.subcategoriesTable.groupId,
            to: r.groupsTable.id,
        }),
    },
    subscriptionsTable: {
        group: r.one.groupsTable({
            from: r.subscriptionsTable.groupId,
            to: r.groupsTable.id,
        }),
        plan: r.one.pricingPlanTable({
            from: r.subscriptionsTable.planId,
            to: r.pricingPlanTable.id,
        }),
        creator: r.one.usersTable({
            from: r.subscriptionsTable.creatorId,
            to: r.usersTable.id,
        }),
        approver: r.one.usersTable({
            from: r.subscriptionsTable.approverId,
            to: r.usersTable.id,
        }),
    },
    transactionSchedulesTable: {
        account: r.one.accountsTable({
            from: r.transactionSchedulesTable.accountId,
            to: r.accountsTable.id,
        }),
        category: r.one.categoriesTable({
            from: r.transactionSchedulesTable.categoryId,
            to: r.categoriesTable.id,
        }),
        subcategory: r.one.subcategoriesTable({
            from: r.transactionSchedulesTable.subcategoryId,
            to: r.subcategoriesTable.id,
        }),
        creator: r.one.usersTable({
            from: r.transactionSchedulesTable.creatorId,
            to: r.usersTable.id,
        }),
        group: r.one.groupsTable({
            from: r.transactionSchedulesTable.groupId,
            to: r.groupsTable.id,
        }),
        transactions: r.many.transactionsTable(),
    },
    transactionsTable: {
        account: r.one.accountsTable({
            from: r.transactionsTable.accountId,
            to: r.accountsTable.id,
        }),
        category: r.one.categoriesTable({
            from: r.transactionsTable.categoryId,
            to: r.categoriesTable.id,
        }),
        subcategory: r.one.subcategoriesTable({
            from: r.transactionsTable.subcategoryId,
            to: r.subcategoriesTable.id,
        }),
        creator: r.one.usersTable({
            from: r.transactionsTable.creatorId,
            to: r.usersTable.id,
        }),
        group: r.one.groupsTable({
            from: r.transactionsTable.groupId,
            to: r.groupsTable.id,
        }),
        inBalanceTransfer: r.one.balanceTransfersTable({
            from: r.balanceTransfersTable.inTransactionId,
            to: r.transactionsTable.id,
        }),
        outBalanceTransfer: r.one.balanceTransfersTable({
            from: r.balanceTransfersTable.outTransactionId,
            to: r.transactionsTable.id,
        }),
        transactionSchedule: r.one.transactionSchedulesTable({
            from: r.transactionsTable.transactionScheduleId,
            to: r.transactionSchedulesTable.id,
        }),
    },
    usersTable: {
        invites: r.many.invitesTable(),
        referrals: r.many.referralsTable(),
        defaultGroup: r.one.groupsTable({
            from: r.usersTable.defaultGroupId,
            to: r.groupsTable.id,
        }),
        memberships: r.many.membershipsTable(),
        currencies: r.many.currenciesTable(),
        categories: r.many.categoriesTable(),
        subcategories: r.many.subcategoriesTable(),
    },
}))
