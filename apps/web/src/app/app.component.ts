import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { App } from '@capacitor/app'
import { AuthStateService } from '@repo/auth'
import { TokenSharingService } from '@repo/common-auth'
import { PageLayout, PageLayoutService } from '@repo/common-page-layouts'
import {
    BackButtonService,
    CheckUpdateService,
    SeoService,
    ThemeService,
} from '@repo/common-services'
import { DisplayBlurComponent } from '@repo/native-devices-util'
import { PermissionRequestToastComponent } from '@repo/permission-request'
import { UserSettingsApiService } from '@repo/user-setting'
import { NgxSonnerToaster } from 'ngx-sonner'
import { ConfirmDialog } from 'primeng/confirmdialog'
import { ConfirmPopup } from 'primeng/confirmpopup'
import { Toast } from 'primeng/toast'
import { filter, map } from 'rxjs'
import { StatusBarService } from '../../../../libs/common-services/src/lib/status-bar.service'
import { LayoutCenteredComponent } from './main/layouts/components/layout-centered/layout-centered.component'
import { LayoutCtaComponent } from './main/layouts/components/layout-cta/layout-cta.component'
import { LayoutDefaultComponent } from './main/layouts/components/layout-default/layout-default.component'
import { LayoutLawyerDefaultComponent } from './main/layouts/components/layout-lawyer-default/layout-lawyer-default.component'
import { LayoutPublicComponent } from './main/layouts/components/layout-public/layout-public.component'
import { LayoutPublicSecondaryComponent } from './main/layouts/components/layout-public-secondary/layout-public-secondary.component'

@Component({
    imports: [
        CommonModule,
        LayoutDefaultComponent,
        LayoutCenteredComponent,
        LayoutCtaComponent,
        LayoutPublicComponent,
        RouterModule,
        NgxSonnerToaster,
        ConfirmDialog,
        ConfirmPopup,
        Toast,
        LayoutPublicSecondaryComponent,
        LayoutLawyerDefaultComponent,
        PermissionRequestToastComponent,
        DisplayBlurComponent,
    ],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    readonly PageLayout = PageLayout
    checkUpdateService = inject(CheckUpdateService)
    private tokenSharingService = inject(TokenSharingService)
    private backButtonService = inject(BackButtonService)
    private statusBarService = inject(StatusBarService)

    layoutService = inject(PageLayoutService)

    private seo = inject(SeoService)
    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)

    private themeService = inject(ThemeService)
    private userSettingsApiService = inject(UserSettingsApiService)

    islocked = false

    async ngOnInit() {
        await this.backButtonService.initialize()
        await this.statusBarService.init()
        this.checkUpdateService.checkForUpdates()
        this.tokenSharingService.init()
        this.loadUserTheme()
        this.listenToRouterEvents()
    }

    private listenToRouterEvents() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                map(() => {
                    let route = this.activatedRoute
                    while (route.firstChild) {
                        route = route.firstChild
                    }
                    return route.snapshot.data
                }),
            )
            .subscribe((data) => {
                this.seo.updateMetaData({
                    title: data['title'] || 'MyApp',
                    description: data['description'],
                    keywords: data['keywords'],
                    ogUrl: data['ogUrl'],
                    ogImage: data['ogImage'],
                    ogTitle: data['ogTitle'],
                    ogDescription: data['ogDescription'],
                })
            })
    }

    private loadUserTheme() {
        this.userSettingsApiService.getUsersSettingsByUserId().subscribe((res) => {
            const settings = res.data?.settings
            if (settings) {
                const isDark = settings['theme'] === 'dark'
                this.themeService.setTheme(isDark)
            }
        })
    }
}
