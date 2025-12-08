import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type CourtsRoutes = {
    courts: Route
}

export const courtsRoutes: CourtsRoutes = {
    courts: {
        path: 'dashboard/courts',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-courts/page-courts.component').then((m) => m.PageCourtsComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
