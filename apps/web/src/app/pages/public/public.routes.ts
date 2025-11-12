import { Route } from '@angular/router'
import { publicGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type PublicRoutes = {
    landing: Route
    lawyers: Route
    blogs: Route
    news: Route
    followCase: Route
    pricing: Route
    lawyerForgotPassword: Route
}

export const publicRoutes: PublicRoutes = {
    landing: {
        path: '',
        loadComponent: () =>
            import('../page-landing/page-landing.component').then(
                (m) => m.PageLandingComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Public) },
        pathMatch: 'full',
        canActivate: [publicGuard()],
        data: {
            title: 'MyApp | Smart Case Management System',
            description:
                'MyApp helps clients find trusted lawyers and law firms while offering smart case management for lawyers to handle cases, clients, and documents easily.',
            keywords:
                'smart case management, find lawyer, hire lawyer, online lawyer Bangladesh, legal software, law firm management',
            ogUrl: 'https://touhidrahman.me',
        },
    },
    lawyers: {
        path: 'lawyers',
        loadComponent: () =>
            import('../page-lawyers/page-lawyers.component').then(
                (m) => m.PageLawyersComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Public) },
        data: {
            title: 'MyApp | Find Lawyers',
            description:
                'Search for experienced lawyers by location, specialty, and reviews on MyApp.',
            keywords: 'lawyer near me, legal help, find lawyer, find attorney',
            ogUrl: 'https://touhidrahman.me/lawyers',
        },
    },
    blogs: {
        path: 'blogs',
        loadComponent: () =>
            import('../page-blogs/page-blogs.component').then(
                (m) => m.PageBlogsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Public) },
    },
    news: {
        path: 'news',
        loadComponent: () =>
            import('../page-news/page-news.component').then(
                (m) => m.PageNewsComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Public) },
    },
    followCase: {
        path: 'follow-case',
        loadComponent: () =>
            import('../page-case-follow/page-case-follow.component').then(
                (m) => m.PageCaseFollowComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Public) },
    },
    pricing: {
        path: 'pricing',
        loadComponent: () =>
            import(
                '../lawyer-account-pages/page-subscription/page-subscription.component'
            ).then((m) => m.PageSubscriptionComponent),
        resolve: { layout: setLayout(PageLayout.Public) },
    },
    lawyerForgotPassword: {
        path: 'lawyer/forgot-password',
        loadComponent: () =>
            import(
                '../lawyer-account-pages/page-lawyer-forgot-password/page-lawyer-forgot-password.component'
            ).then((m) => m.PageLawyerForgotPasswordComponent),
        resolve: { layout: setLayout(PageLayout.Public) },
    },
}
