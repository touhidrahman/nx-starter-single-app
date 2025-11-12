import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type AppointmentsRoutes = {
    appointments: Route
}

export const appointmentsRoutes: AppointmentsRoutes = {
    appointments: {
        path: 'dashboard/appointments',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-appointments/page-appointments.component').then(
                (m) => m.PageAppointmentsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
