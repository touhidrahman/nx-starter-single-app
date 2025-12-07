import { Route } from '@angular/router'
import { authGuard, groupOwnerGuard, groupTypeGuard, permissionGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type OrganizationRoutes = {
    organization: Route
    team: Route
    lawyerTeam: Route
    clientTeam: Route
    followedOrganizations: Route
}

export const organizationRoutes: OrganizationRoutes = {
    organization: {
        path: 'dashboard/organization',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import(
                '../../pages/page-organization-details/page-organization-details.component'
            ).then((m) => m.PageOrganizationDetailsComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
        children: [
            {
                path: '',
                loadComponent: () =>
                    import(
                        '../../main/organization-permission/organization/organization-content.component'
                    ).then((m) => m.OrganizationContentComponent),
            },
            {
                path: 'invitations',
                canActivate: [permissionGuard(['invite:write'], { showError: true })],
                loadComponent: () =>
                    import(
                        '../../main/organization-permission/invitations/invitations-content.component'
                    ).then((m) => m.InvitationsContentComponent),
            },
            {
                path: 'permission',
                canActivate: [groupOwnerGuard, permissionGuard(['role:read'], { showError: true })],
                loadComponent: () =>
                    import('@repo/group').then((m) => m.PermissionsContentComponent),
            },
            {
                path: 'subscriptions-usages',
                canActivate: [groupOwnerGuard, groupTypeGuard({ redirectTo: ['/'] })],
                loadComponent: () =>
                    import(
                        '../../pages/page-subscription-usages/page-subscription-usages.component'
                    ).then((m) => m.PageSubscriptionUsagesComponent),
            },

            {
                path: 'subscribe-plan/:id',
                canActivate: [groupOwnerGuard, groupTypeGuard({ redirectTo: ['/'] })],
                loadComponent: () =>
                    import('@repo/subscription').then((m) => m.SubscribePlanComponent),
            },
        ],
    },
    team: {
        path: 'team',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../../pages/page-team/page-team.component').then((m) => m.PageTeamComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    lawyerTeam: {
        path: 'lawyer-team',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../../pages/page-lawyer-team/page-lawyer-team.component').then(
                (m) => m.PageLawyerTeamComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Cta) },
    },
    clientTeam: {
        path: 'client-team',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../../pages/page-client-team/page-client-team.component').then(
                (m) => m.PageClientTeamComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Cta) },
    },
    followedOrganizations: {
        path: 'dashboard/followed-organizations',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import(
                '../../pages/page-client-organizations/page-client-organizations.component'
            ).then((m) => m.PageClientOrganizationsComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
