import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type TasksRoutes = {
    tasks: Route
}

export const tasksRoutes: TasksRoutes = {
    tasks: {
        path: 'dashboard/tasks',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-task/page-task.component').then(
                (m) => m.PageTaskComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
}
