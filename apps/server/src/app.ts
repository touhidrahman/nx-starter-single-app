import { uniq } from 'es-toolkit'
import { pad } from 'es-toolkit/string'
import { authV1Routes } from './auth/auth.routes'
import configureOpenAPI from './core/configure-open-api'
import { coreRoutes } from './core/core.routes'
import createApp from './core/create-app'
import { accountCoreRoutes } from './main/account/core/account-core.routes'
import { accountCrudRoutes } from './main/account/crud/account-crud.routes'
import { accountTypeCoreRoutes } from './main/account-type/core/account-type-core.routes'
import { adminCrudRoutes } from './main/admin/crud/admin-crud.routes'
import { adminCustomRoutes } from './main/admin/custom/admin-custom.routes'
import { logsV1Route } from './main/audit-log/audit-log.routes'
import { authRoutes } from './main/auth/auth.routes'
import { claimV1Routes } from './main/claim/claim.routes'
import { dashboardV1Routes } from './main/dashboard/dashboard.routes'
import { databaseBackupV1Routes } from './main/database-backup/database-backup.routes'
import { feedbackV1Routes } from './main/feedback/feedback.routes'
import { groupsV1Route } from './main/group/group.routes'
import { invitesV1Route } from './main/invite/invites.routes'
import { newsTickerV1Routes } from './main/news-ticker/news-ticker.routes'
import { planV1Routes } from './main/plan/plan.routes'
import { referralCodeV1Routes } from './main/referral/referral.routes'
import { roleV1Routes } from './main/role/role.routes'
import { storageV1Routes } from './main/storage/storage.routes'
import { subscriptionV1Route } from './main/subscription/subscription.routes'
import { transactionCoreRoutes } from './main/transaction/core/transaction-core.routes'
import { transactionCrudRoutes } from './main/transaction/crud/transaction-crud.routes'
import { userCoreRoutes } from './main/user/core/user-core.routes'
import { userCrudRoutes } from './main/user/crud/user-crud.routes'
import { userCustomRoutes } from './main/user/custom/user-custom.routes'
import { userSettingsV1Routes } from './main/user-settings/user-setting.routes'

const app = createApp()

const routes = [
    coreRoutes,
    accountCoreRoutes,
    accountCrudRoutes,
    accountTypeCoreRoutes,
    adminCrudRoutes,
    adminCustomRoutes,
    authV1Routes,
    authRoutes,
    claimV1Routes,
    dashboardV1Routes,
    databaseBackupV1Routes,
    feedbackV1Routes,
    groupsV1Route,
    invitesV1Route,
    logsV1Route,
    newsTickerV1Routes,
    planV1Routes,
    referralCodeV1Routes,
    roleV1Routes,
    storageV1Routes,
    subscriptionV1Route,
    transactionCoreRoutes,
    transactionCrudRoutes,
    userSettingsV1Routes,
    userCoreRoutes,
    userCrudRoutes,
    userCustomRoutes,
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
