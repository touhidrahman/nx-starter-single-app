import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type ProfileRoutes = {
    profile: Route
    lawyerProfile: Route
}

export const profileRoutes: ProfileRoutes = {
    profile: {
        path: 'profile',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-profile/page-profile.component').then((m) => m.PageProfileComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    lawyerProfile: {
        path: 'lawyer-profile',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-lawyer-profile/page-lawyer-profile.component').then(
                (m) => m.PageLawyerProfileComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
