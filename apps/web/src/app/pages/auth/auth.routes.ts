import { Route } from '@angular/router'
import { publicGuard } from '@repo/auth'
import { PageLayout, setLayout } from '@repo/common-page-layouts'

export type AuthRoutes = {
    signup: Route
    forgotPassword: Route
    newPassword: Route
    passwordResetResult: Route
    resetPassword: Route
    accountCreated: Route
    accountVerify: Route
    verifyPhone: Route
    login: Route
    accept: Route
    createProfile: Route
    statusPending: Route
    profileCreated: Route
    payment: Route
    verificationEmailSent: Route
}

export const authRoutes: AuthRoutes = {
    signup: {
        path: 'signup',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageSignUpComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
        canActivate: [publicGuard()],
        data: {
            title: 'MyApp | Sign Up',
        },
    },
    forgotPassword: {
        path: 'forgot-password',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageForgotPasswordComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    newPassword: {
        path: 'new-password/:token',
        loadComponent: () =>
            import(
                '../page-set-new-password/page-set-new-password.component'
            ).then((m) => m.PageSetNewPasswordComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    passwordResetResult: {
        path: 'password-reset-result',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PasswordResetResultComponent),
        resolve: { layout: setLayout(PageLayout.Cta) },
    },
    resetPassword: {
        path: 'reset-password',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageResetPasswordComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    accountCreated: {
        path: 'account-created',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageAccountCreatedComponent),
        resolve: { layout: setLayout(PageLayout.Cta) },
    },
    accountVerify: {
        path: 'account-verify/:token',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageAccountVerifyComponent),
        resolve: { layout: setLayout(PageLayout.Cta) },
    },
    verifyPhone: {
        path: 'verify-phone/:token',
        loadComponent: () =>
            import('@repo/auth').then(
                (m) => m.PageUserPhoneVerificationComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    login: {
        path: 'login',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageLoginComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
        data: {
            title: 'MyApp | Sign In',
        },
    },
    accept: {
        path: 'accept',
        loadComponent: () =>
            import('../page-accept-invite/page-accept-invite.component').then(
                (m) => m.PageAcceptInviteComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    createProfile: {
        path: 'create-profile',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageCreateProfileFormComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    statusPending: {
        path: 'status-pending',
        loadComponent: () =>
            import(
                '../page-organization-status-pending/page-organization-status-pending'
            ).then((m) => m.pageOrganizationStatusPendingComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    profileCreated: {
        path: 'profile-created',
        loadComponent: () =>
            import('@repo/auth').then((m) => m.PageProfileCreatedComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    payment: {
        path: 'payment',
        loadComponent: () =>
            import('../page-payment/page-payment.component').then(
                (c) => c.PagePaymentComponent,
            ),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
    verificationEmailSent: {
        path: 'verification-email-sent',
        loadComponent: () =>
            import(
                '../page-verification-email-sent/page-verification-email-sent.component'
            ).then((c) => c.PageVerificationEmailSentComponent),
        resolve: { layout: setLayout(PageLayout.Center) },
    },
}
