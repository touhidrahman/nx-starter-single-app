import { Route } from '@angular/router'
import { authGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'
import { FeedbackGuard } from '@repo/feedback'

export type FeedbackRoutes = {
    feedback: Route
    feedbackSuccess: Route
    feedbackFailed: Route
}

export const feedbackRoutes: FeedbackRoutes = {
    feedback: {
        path: 'dashboard/feedback',
        canActivate: [authGuard({ redirectTo: ['/login'] })],
        loadComponent: () =>
            import('../page-feedback/page-feedback.component').then((m) => m.PageFeedbackComponent),
        resolve: { layout: setLayout(PageLayout.Default) },
    },
    feedbackSuccess: {
        path: 'dashboard/feedback-success',
        canActivate: [authGuard({ redirectTo: ['/login'] }), FeedbackGuard],
        loadComponent: () =>
            import('../feedback/page-feedback-success/page-feedback-success.component').then(
                (m) => m.PageFeedbackSuccessComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    feedbackFailed: {
        path: 'dashboard/feedback-failed',
        canActivate: [authGuard({ redirectTo: ['/login'] }), FeedbackGuard],
        loadComponent: () =>
            import('../feedback/page-feedback-failed/page-feedback-failed.component').then(
                (m) => m.PageFeedbackFailedComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
}
