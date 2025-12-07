import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type HomeRoutes = {
    home: Route
}

export const homeRoutes: HomeRoutes = {
    home: {
        path: 'dashboard/home',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-home/page-home.component').then((m) => m.PageHomeComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
