import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type CauseListRoutes = {
    causeList: Route
}

export const causeListRoutes: CauseListRoutes = {
    causeList: {
        path: 'dashboard/cause-list',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('./page-cause-list/page-cause-list.component').then(
                (m) => m.PageCauseListComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
