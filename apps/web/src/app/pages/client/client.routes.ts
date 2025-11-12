import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type ClientRoutes = {
    clients: Route
    homeClient: Route
    clientDetails: Route
}

export const clientRoutes: ClientRoutes = {
    clients: {
        path: 'dashboard/clients',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../../pages/page-clients/page-clients.component').then(
                (m) => m.PageClientsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    homeClient: {
        path: 'dashboard/home/client',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import(
                '../../pages/page-home-client/page-home-client.component'
            ).then((m) => m.PageHomeClientComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    clientDetails: {
        path: 'dashboard/clients/:id',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../../pages/page-client/page-client.component').then(
                (m) => m.PageClientComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
