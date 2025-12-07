import type { Route } from '@angular/router'
import { adminAuthGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

const authRoutes: Route[] = [
    {
        path: 'signup',
        loadComponent: () => import('@repo/auth').then((m) => m.PageAdminSignupComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('@repo/auth').then((m) => m.PageForgotPasswordComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    {
        path: 'reset-password',
        loadComponent: () => import('@repo/auth').then((m) => m.PageResetPasswordComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    {
        path: 'account-created',
        loadComponent: () => import('@repo/auth').then((m) => m.PageAccountCreatedComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    {
        path: 'account-verify/:token',
        loadComponent: () => import('@repo/auth').then((m) => m.PageAccountVerifyComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },

    {
        path: 'login',
        loadComponent: () => import('@repo/auth').then((m) => m.PageAdminLoginComponent),
        resolve: { layout: setLayout(PageLayout.Blank) },
    },
]

export const appRoutes: Route[] = [
    ...authRoutes,
    {
        path: 'dashboard-home',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-dashboard-home/page-dashboard-home.component').then(
                (m) => m.PageDashboardHomeComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },

    {
        path: 'groups',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-group-management/page-group-management.component').then(
                (m) => m.PageGroupManagementComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'group/:groupId',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-group-details/page-group-details.component').then(
                (m) => m.PageGroupDetailsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
        children: [
            {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full',
            },
            {
                path: 'details',
                loadComponent: () =>
                    import('./pages/group-details/group-details.component').then(
                        (m) => m.GroupDetailsComponent,
                    ),
            },
            {
                path: 'permission',
                loadComponent: () =>
                    import('@repo/group').then((m) => m.PermissionsContentComponent),
            },
            {
                path: 'members',
                loadComponent: () => import('@repo/group').then((m) => m.GroupMembersComponent),
            },
            {
                path: 'cases',
                loadComponent: () => import('@repo/group').then((m) => m.GroupCasesListComponent),
            },
            {
                path: 'messages',
                loadComponent: () => import('@repo/group').then((m) => m.GroupMessageListComponent),
            },
        ],
    },

    {
        path: 'permission-name',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-claim/page-claim.component').then((m) => m.PageClaimComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'profile',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-profile/page-profile.component').then(
                (m) => m.PageProfileComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'dashboard/cases',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-cases/page-cases.component').then((m) => m.PageCasesComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'dashboard/courts',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-court/page-court.component').then((m) => m.PageCourtComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },

    {
        path: 'admins',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-admin-userlist/page-admin-userlist.component').then(
                (m) => m.PageAdminUserlistComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },

    {
        path: 'client-client-user-list',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-client-user-list/page-client-user-list.component').then(
                (m) => m.PageClientUserListComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'lawyer-list',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-lawyer-list/page-lawyer-list.component').then(
                (m) => m.PageLawyerListComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'plans',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-plan-list/page-plan-list.component').then(
                (c) => c.PagePlanListComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'subscription-list',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-subscription-list/page-subscription-list.component').then(
                (c) => c.PageSubscriptionListComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'subscription-request-list',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-subscriptions-request/page-subscriptions-request.component').then(
                (c) => c.PageSubscriptionsRequestComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'blogs',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-blog/page-blog.component').then((m) => m.PageBlogComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'news-tickers',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-news-ticker/page-news-ticker.component').then(
                (m) => m.PageNewsTickerComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'backups',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-database-backup/page-database-backup.component').then(
                (m) => m.PageDatabaseBackupComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'blogs/create',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./features/blog/components/create-blog/create-blog.component').then(
                (m) => m.CreateBlogComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'blogs/edit/:title',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./features/blog/components/create-blog/create-blog.component').then(
                (m) => m.CreateBlogComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'news',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-news/page-news.component').then((m) => m.PageNewsComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'news/create',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./features/news/components/create-news/create-news.component').then(
                (m) => m.CreateNewsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'news/edit/:title',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./features/news/components/create-news/create-news.component').then(
                (m) => m.CreateNewsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'users',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-users-management/page-users-management.component').then(
                (m) => m.PageUsersManagementComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'audit-log',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-audit-log/page-audit-log.component').then(
                (m) => m.PageAuditLogComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: 'feedback',
        canActivate: [adminAuthGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./pages/page-feedback-list/page-feedback-list.component').then(
                (m) => m.PageFeedbackListComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    {
        path: '',
        redirectTo: 'dashboard-home',
        pathMatch: 'full',
    },
    {
        path: '**',
        loadComponent: () => import('@repo/public-pages').then((m) => m.PageNotFoundComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
]
