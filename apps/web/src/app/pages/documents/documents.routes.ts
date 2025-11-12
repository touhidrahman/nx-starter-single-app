import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type DocumentsRoutes = {
    documents: Route
}

export const documentsRoutes: DocumentsRoutes = {
    documents: {
        path: 'dashboard/documents',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-documents/page-documents.component').then(
                (m) => m.PageDocumentsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
