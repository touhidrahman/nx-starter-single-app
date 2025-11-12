import { Route } from '@angular/router'
import { authGuard, groupTypeGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type SettingsRoutes = {
    settings: Route
}

export const settingsRoutes: SettingsRoutes = {
    settings: {
        path: 'dashboard/settings',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-settings/page-settings').then(
                (m) => m.PageSettingsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
        children: [
            {
                path: '',
                loadComponent: () =>
                    import(
                        '../../main/settings/preferences/preferences.component'
                    ).then((m) => m.PreferencesComponent),
            },
            {
                path: 'set-pin',
                loadComponent: () =>
                    import(
                        '../../main/settings/generate-pin/generate-pin.component'
                    ).then((m) => m.GeneratePinComponent),
            },
        ],
    },
}
