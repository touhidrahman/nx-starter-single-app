import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common'
import {
    provideHttpClient,
    withInterceptors,
    withInterceptorsFromDi,
    withJsonpSupport,
    withXsrfConfiguration,
} from '@angular/common/http'
import {
    type ApplicationConfig,
    importProvidersFrom,
    isDevMode,
    provideAppInitializer,
    provideZonelessChangeDetection,
} from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import {
    PreloadAllModules,
    provideRouter,
    RouteReuseStrategy,
    withComponentInputBinding,
    withInMemoryScrolling,
    withPreloading,
    withRouterConfig,
} from '@angular/router'
import { provideServiceWorker } from '@angular/service-worker'
import { FullCalendarModule } from '@fullcalendar/angular'
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone'
import { NgIconsModule, provideNgIconsConfig } from '@ng-icons/core'
import {
    heroArrowPath,
    heroBookOpen,
    heroChevronDown,
    heroChevronUp,
    heroClock,
    heroDocumentText,
    heroUser,
    heroUserPlus,
    heroUsers,
} from '@ng-icons/heroicons/outline'
import Aura from '@primeuix/themes/aura'
import {
    ACCESS_TOKEN_KEY,
    AUTH_API_URL,
    AuthHeaderInterceptorFn,
    REFRESH_TOKEN_KEY,
} from '@repo/common-auth'
import { APP_ENVIRONMENT, appInitializerFn } from '@repo/core'
import { ConfirmationService, MessageService } from 'primeng/api'
import { providePrimeNG } from 'primeng/config'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { environment } from '../environment/environment'
import { appRoutes } from './app.routes'

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: APP_ENVIRONMENT, useValue: environment },
        { provide: AUTH_API_URL, useValue: environment.authApiUrl },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: ACCESS_TOKEN_KEY, useValue: 'appAccessToken' },
        { provide: REFRESH_TOKEN_KEY, useValue: 'appRefreshToken' },
        provideAppInitializer(appInitializerFn),
        provideIonicAngular(),
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
            withInterceptors([AuthHeaderInterceptorFn]),
            withInterceptorsFromDi(),
        ),
        importProvidersFrom(FullCalendarModule),
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
                    darkModeSelector: '.dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng, utilities',
                    },
                },
            },
        }),

        provideNgIconsConfig({
            size: '1.5rem',
            color: 'currentColor',
        }),

        importProvidersFrom(
            NgIconsModule.withIcons({
                heroClock,
                heroDocumentText,
                heroUsers,
                heroChevronUp,
                heroChevronDown,
                heroArrowPath,
                heroUserPlus,
                heroBookOpen,
                heroUser,
            }),
        ),
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
