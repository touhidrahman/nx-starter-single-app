import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type AdminRoutes = {
    adminUserlist: Route
}

export const adminRoutes: AdminRoutes = {
    adminUserlist: {
        path: 'admin-userlist',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-admin-userlist/page-admin-userlist.component').then(
                (m) => m.PageAdminUserlistComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
