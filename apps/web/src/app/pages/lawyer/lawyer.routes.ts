import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type LawyerRoutes = {
    lawyerHome: Route
    lawyerOrganization: Route
    lawyerProfile: Route
    lawyerSettings: Route
}

export const lawyerRoutes: LawyerRoutes = {
    lawyerHome: {
        path: 'lawyer/home',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import(
                '../lawyer-account-pages/page-lawyer-dashboard/page-lawyer-dashboard.component'
            ).then((m) => m.PageLawyerDashboardComponent),
        resolve: { layout: setLayout(PageLayout.lawyerDefault) },
    },
    lawyerOrganization: {
        path: 'lawyer/organization',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import(
                '../lawyer-account-pages/page-lawyer-organization/page-lawyer-organization.component'
            ).then((m) => m.PageLawyerOrganizationComponent),
        resolve: { layout: setLayout(PageLayout.lawyerDefault) },
    },
    lawyerProfile: {
        path: 'lawyer/profile',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import(
                '../lawyer-account-pages/page-lawyer-profile/page-lawyer-profile.component'
            ).then((m) => m.PageLawyerProfileComponent),
        resolve: { layout: setLayout(PageLayout.lawyerDefault) },
    },
    lawyerSettings: {
        path: 'lawyer/settings',
        loadComponent: () =>
            import(
                '../lawyer-account-pages/page-lawyer-settings/page-lawyer-settings.component'
            ).then((m) => m.PageLawyerSettingsComponent),
        resolve: { layout: setLayout(PageLayout.lawyerDefault) },
    },
}
