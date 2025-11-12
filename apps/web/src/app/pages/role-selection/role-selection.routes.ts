import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type RoleSelectionRoutes = {
    selectRole: Route
}

export const roleSelectionRoutes: RoleSelectionRoutes = {
    selectRole: {
        path: 'select-role',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-select-role/page-select-role.component').then(
                (m) => m.PageSelectRoleComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Cta) },
    },
}
