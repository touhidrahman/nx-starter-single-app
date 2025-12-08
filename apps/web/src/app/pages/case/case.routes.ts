import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type CaseRoutes = {
    case: Route
    caseEvent: Route
    cases: Route
    myCases: Route
    clientCase: Route
    createCase: Route
}

export const caseRoutes: CaseRoutes = {
    createCase: {
        path: 'dashboard/cases/create',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () => import('@repo/case').then((m) => m.CreateCaseComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },

    case: {
        path: 'dashboard/case/:id',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-case/page-case.component').then((m) => m.PageCaseComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
        children: [
            {
                path: '',
                redirectTo: 'event',
                pathMatch: 'full',
            },
            {
                path: 'event',
                loadComponent: () =>
                    import('../page-case-events/page-case-events.component').then(
                        (m) => m.PageCaseEventsComponent,
                    ),
            },
            {
                path: 'parties',
                loadComponent: () =>
                    import('../page-case-parties/page-case-parties.component').then(
                        (m) => m.PageCasePartiesComponent,
                    ),
            },
            {
                path: 'documents',
                loadComponent: () =>
                    import('../page-case-documents/page-case-documents.component').then(
                        (m) => m.PageCaseDocumentsComponent,
                    ),
            },
            {
                path: 'clients',
                loadComponent: () =>
                    import('../page-case-clients/page-case-clients.component').then(
                        (m) => m.PageCaseClientsComponent,
                    ),
                data: { inheritParams: true },
            },
            {
                path: 'court-transfer',
                loadComponent: () =>
                    import('../page-court-transfer/page-court-transfer.component').then(
                        (m) => m.PageCourtTransferComponent,
                    ),
            },
            {
                path: 'followers',
                loadComponent: () =>
                    import('../page-case-followers/page-case-followers.component').then(
                        (m) => m.PageCaseFollowersComponent,
                    ),
            },
            {
                path: 'notes',
                loadComponent: () =>
                    import('../page-case-notes/page-case-notes.component').then(
                        (m) => m.PageCaseNotesComponent,
                    ),
            },
            {
                path: 'case-members',
                loadComponent: () =>
                    import('../page-case-member/page-case-member.component').then(
                        (m) => m.PageCaseMemberComponent,
                    ),
            },
            {
                path: 'causelist',
                loadComponent: () =>
                    import(
                        '../page-cause-list-case-details/page-cause-list-case-details.component'
                    ).then((m) => m.PageCauseListCaseDetailsComponent),
            },
        ],
    },
    caseEvent: {
        path: 'dashboard/case/:id/case-event',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () => import('@repo/case').then((m) => m.CaseHistoryComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    cases: {
        path: 'dashboard/cases',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-cases/page-cases.component').then((m) => m.PageCasesComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    myCases: {
        path: 'dashboard/my-cases',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-followed-cases/page-followed-cases.component').then(
                (m) => m.PageFollowedCasesComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    clientCase: {
        path: 'client/cases/:id',
        loadComponent: () =>
            import('../page-client-case/page-client-case.component').then(
                (m) => m.PageClientCaseComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
        children: [
            {
                path: '',
                redirectTo: 'event',
                pathMatch: 'full',
            },
            {
                path: 'event',
                loadComponent: () =>
                    import(
                        '../page-client-organization-case-history/page-client-organization-case-history.component'
                    ).then((m) => m.PageClientOrganizationCaseHistoryComponent),
            },
            {
                path: 'documents',
                loadComponent: () =>
                    import('../page-case-documents/page-case-documents.component').then(
                        (m) => m.PageCaseDocumentsComponent,
                    ),
            },
        ],
    },
}
