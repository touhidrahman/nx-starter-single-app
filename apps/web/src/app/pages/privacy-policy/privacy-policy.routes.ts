import { Route } from '@angular/router'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type PrivacyPolicyRoutes = {
    privacyPolicy: Route
    termsConditions: Route
}

export const privacyPolicyRoutes: PrivacyPolicyRoutes = {
    privacyPolicy: {
        path: 'privacy-policy',
        loadComponent: () =>
            import('@repo/public-pages').then(
                (m) => m.PagePrivacyPolicyComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    termsConditions: {
        path: 'terms-and-conditions',
        loadComponent: () =>
            import('@repo/public-pages').then(
                (m) => m.PageTermsConditionsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
}
