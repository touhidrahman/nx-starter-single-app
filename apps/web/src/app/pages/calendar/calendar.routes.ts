import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type CalendarRoutes = {
    calendar: Route
}

export const calendarRoutes: CalendarRoutes = {
    calendar: {
        path: 'dashboard/calendar',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-calender/page-calender.component').then(
                (m) => m.PageCalenderComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
