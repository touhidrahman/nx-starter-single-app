import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type ReferralRoutes = {
    referral: Route
}

export const referralRoutes: ReferralRoutes = {
    referral: {
        path: 'dashboard/referral',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-referral/page-referral.component').then((m) => m.PageReferralComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
