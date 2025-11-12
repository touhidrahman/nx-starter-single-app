import { Route } from '@angular/router'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type NotFoundRoutes = {
    notFound: Route
}

export const notFoundRoutes: NotFoundRoutes = {
    notFound: {
        path: '**',
        loadComponent: () =>
            import('@repo/public-pages').then((m) => m.PageNotFoundComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
}
