import { Route } from '@angular/router'
import { AdminRoutes, adminRoutes } from './pages/admin/admin.routes'
import { AuthRoutes, authRoutes } from './pages/auth/auth.routes'
import { notFoundRoutes } from './pages/not-found/not-found.routes'

type AppRouteGroups = [AdminRoutes, AuthRoutes]

const groupedRoutes: AppRouteGroups = [adminRoutes, authRoutes]

const flattenedRoutes: Route[] = []
for (const routeGroup of groupedRoutes) {
    for (const route of Object.values(routeGroup)) {
        flattenedRoutes.push(route)
    }
}
flattenedRoutes.push(notFoundRoutes.notFound)

export const appRoutes = flattenedRoutes
