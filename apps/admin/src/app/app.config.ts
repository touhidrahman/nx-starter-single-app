import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common'
import {
    provideHttpClient,
    withInterceptors,
    withInterceptorsFromDi,
    withJsonpSupport,
    withXsrfConfiguration,
} from '@angular/common/http'
import {
    ApplicationConfig,
    importProvidersFrom,
    inject,
    isDevMode,
    provideAppInitializer,
    provideZonelessChangeDetection,
} from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import {
    PreloadAllModules,
    provideRouter,
    withComponentInputBinding,
    withInMemoryScrolling,
    withPreloading,
    withRouterConfig,
} from '@angular/router'
import { provideServiceWorker } from '@angular/service-worker'
import Aura from '@primeuix/themes/aura'
import { AdminAuthStateService } from '@repo/auth'
import {
    ACCESS_TOKEN_KEY,
    AUTH_API_URL,
    AuthAdminHeaderInterceptorFn,
    REFRESH_TOKEN_KEY,
} from '@repo/common-auth'
import { APP_ENVIRONMENT } from '@repo/core'
import { ConfirmationService, MessageService } from 'primeng/api'
import { providePrimeNG } from 'primeng/config'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { environment } from '../environment/environment'
import { appRoutes } from './app.routes'

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: APP_ENVIRONMENT, useValue: environment },
        { provide: AUTH_API_URL, useValue: environment.authApiUrl },
        { provide: ACCESS_TOKEN_KEY, useValue: 'appAdminAccessToken' },
        { provide: REFRESH_TOKEN_KEY, useValue: 'appAdminRefreshToken' },
        provideAppInitializer(() => {
            const authStateService = inject(AdminAuthStateService)
            authStateService.initAuthFromStorage()
            return Promise.resolve()
        }),
        provideZonelessChangeDetection(),
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
            withRouterConfig({ onSameUrlNavigation: 'reload' }),
            withComponentInputBinding(),
            withPreloading(PreloadAllModules),
        ),
        provideHttpClient(
            withXsrfConfiguration({}),
            withJsonpSupport(),
            withInterceptors([AuthAdminHeaderInterceptorFn]),
            withInterceptorsFromDi(),
        ),
        importProvidersFrom(BrowserModule),
        {
            provide: DATE_PIPE_DEFAULT_OPTIONS,
            useValue: { timezone: 'UTC', dateFormat: 'shortDate' },
        },
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    darkModeSelector: '.app-dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng, utilities',
                    },
                },
            },
        }),
        MessageService,
        ConfirmationService,
        DialogService,
        DynamicDialogRef,
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
}
