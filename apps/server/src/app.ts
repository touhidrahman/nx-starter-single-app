import { uniq } from 'es-toolkit'
import { pad } from 'es-toolkit/string'
import configureOpenAPI from './core/configure-open-api'
import { coreRoutes } from './core/core.routes'
import createApp from './core/create-app'
import { accountCoreRoutes } from './main/account/core/account-core.routes'
import { accountCrudRoutes } from './main/account/crud/account-crud.routes'
import { accountCustomRoutes } from './main/account/custom/account-custom.routes'
import { accountTypeCoreRoutes } from './main/account-type/core/account-type-core.routes'
import { adminCrudRoutes } from './main/admin/crud/admin-crud.routes'
import { adminCustomRoutes } from './main/admin/custom/admin-custom.routes'
import { auditLogCoreRoutes } from './main/audit-log/core/audit-log-core.routes'
import { auditLogCrudRoutes } from './main/audit-log/crud/audit-log-crud.routes'
import { auditLogCustomRoutes } from './main/audit-log/custom/audit-log-custom.routes'
import { authRoutes } from './main/auth/auth.routes'
import { authInviteRoutes } from './main/auth/auth-invite.routes'
import { authPasswordRoutes } from './main/auth/auth-password.routes'
import { authVerifyRoutes } from './main/auth/auth-verify.routes'
import { categoryCoreRoutes } from './main/category/core/category-core.routes'
import { categoryCrudRoutes } from './main/category/crud/category-crud.routes'
import { categoryCustomRoutes } from './main/category/custom/category-custom.routes'
import { claimV1Routes } from './main/claim/claim.routes'
import { currencyCoreRoutes } from './main/currency/core/currency-core.routes'
import { currencyCrudRoutes } from './main/currency/crud/currency-crud.routes'
import { dashboardV1Routes } from './main/dashboard/dashboard.routes'
import { databaseBackupV1Routes } from './main/database-backup/database-backup.routes'
import { feedbackV1Routes } from './main/feedback/feedback.routes'
import { groupCoreRoutes } from './main/group/core/group-core.routes'
import { groupCrudRoutes } from './main/group/crud/group-crud.routes'
import { groupCustomRoutes } from './main/group/custom/group-custom.routes'
import { inviteCoreRoutes } from './main/invite/core/invite-core.routes'
import { inviteCrudRoutes } from './main/invite/crud/invite-crud.routes'
import { inviteCustomRoutes } from './main/invite/custom/invite-custom.routes'
import { planCoreRoutes } from './main/plan/core/plan-core.routes'
import { planCrudRoutes } from './main/plan/crud/plan-crud.routes'
import { planCustomRoutes } from './main/plan/custom/plan-custom.routes'
import { storageV1Routes } from './main/storage/storage.routes'
import { subcategoryCoreRoutes } from './main/subcategory/core/subcategory-core.routes'
import { subcategoryCrudRoutes } from './main/subcategory/crud/subcategory-crud.routes'
import { subcategoryCustomRoutes } from './main/subcategory/custom/subcategory-custom.routes'
import { subscriptionCoreRoutes } from './main/subscription/core/subscription-core.routes'
import { subscriptionCrudRoutes } from './main/subscription/crud/subscription-crud.routes'
import { subscriptionCustomRoutes } from './main/subscription/custom/subscription-custom.routes'
import { transactionRoutes } from './main/transaction/transaction.routes'
import { transactionCoreRoutes } from './main/transaction/transaction-core.routes'
import { transactionCrudRoutes } from './main/transaction/transaction-crud.routes'
import { allTransactionScheduleRoutes } from './main/transaction-schedule'
import { transactionScheduleCoreRoutes } from './main/transaction-schedule/transaction-schedule-core.routes'
import { transactionScheduleCrudRoutes } from './main/transaction-schedule/transaction-schedule-crud.routes'
import { transactionScheduleRoutes } from './main/transaction-schedule/transaction-schedule-custom.routes'
import { userCoreRoutes } from './main/user/core/user-core.routes'
import { userCrudRoutes } from './main/user/crud/user-crud.routes'
import { userCustomRoutes } from './main/user/custom/user-custom.routes'
import { userSettingCoreRoutes } from './main/user-settings/core/user-setting-core.routes'
import { userSettingCrudRoutes } from './main/user-settings/crud/user-setting-crud.routes'
import { userSettingCustomRoutes } from './main/user-settings/custom/user-setting-custom.routes'

const app = createApp()

const routes = [
    coreRoutes,
    accountCoreRoutes,
    accountCrudRoutes,
    accountCustomRoutes,
    accountTypeCoreRoutes,
    adminCrudRoutes,
    adminCustomRoutes,
    auditLogCoreRoutes,
    auditLogCrudRoutes,
    auditLogCustomRoutes,
    authInviteRoutes,
    authPasswordRoutes,
    authRoutes,
    authVerifyRoutes,
    categoryCoreRoutes,
    categoryCrudRoutes,
    categoryCustomRoutes,
    claimV1Routes,
    currencyCoreRoutes,
    currencyCrudRoutes,
    dashboardV1Routes,
    databaseBackupV1Routes,
    feedbackV1Routes,
    groupCoreRoutes,
    groupCrudRoutes,
    groupCustomRoutes,
    inviteCoreRoutes,
    inviteCrudRoutes,
    inviteCustomRoutes,
    planCoreRoutes,
    planCrudRoutes,
    planCustomRoutes,
    storageV1Routes,
    subcategoryCoreRoutes,
    subcategoryCrudRoutes,
    subcategoryCustomRoutes,
    subscriptionCoreRoutes,
    subscriptionCrudRoutes,
    subscriptionCustomRoutes,
    transactionCoreRoutes,
    transactionCrudRoutes,
    transactionRoutes,
    transactionScheduleCoreRoutes,
    transactionScheduleCrudRoutes,
    transactionScheduleRoutes,
    ...allTransactionScheduleRoutes,
    userCoreRoutes,
    userCrudRoutes,
    userCustomRoutes,
    userSettingCoreRoutes,
    userSettingCrudRoutes,
    userSettingCustomRoutes,
]

configureOpenAPI(app)

const paths = []
for (const route of routes) {
    paths.push(
        ...uniq(route.routes.map((r) => `${pad(r.method, 8)}: ${r.path}`)),
    )
    app.route('/', route)
}
console.log('Registered routes:\n')
console.log(paths.join('\n'))

export default app
