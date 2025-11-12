import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type CommunicationRoutes = {
    communication: Route
}

export const communicationRoutes: CommunicationRoutes = {
    communication: {
        path: 'dashboard/communication',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-communication/page-communication.component').then(
                (m) => m.PageCommunicationComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
