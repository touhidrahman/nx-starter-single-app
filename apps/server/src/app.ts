import { uniq } from 'es-toolkit'
import { pad } from 'es-toolkit/string'
import configureOpenAPI from './core/configure-open-api'
import { coreRoutes } from './core/core.routes'
import createApp from './core/create-app'
import { accountBaseRoutes } from './main/account/base/account-base.routes'
import { accountCommonRoutes } from './main/account/common/account-common.routes'
import { adminUserV1Routes } from './main/admin/admin-user.routes'
import { logsV1Route } from './main/audit-log/audit-log.routes'
import { authV1Routes } from './main/auth/auth.routes'
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
import { transactionBasicRoutes } from './main/transaction/basic/transaction-basic.routes'
import { transactionCommonRoutes } from './main/transaction/common/transaction-common.routes'
import { userV1Routes } from './main/user/user.routes'
import { userSettingsV1Routes } from './main/user-settings/user-setting.routes'

const app = createApp()

const routes = [
    coreRoutes,
    accountBaseRoutes,
    accountCommonRoutes,
    adminUserV1Routes,
    authV1Routes,
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
    transactionBasicRoutes,
    transactionCommonRoutes,
    userSettingsV1Routes,
    userV1Routes,
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
