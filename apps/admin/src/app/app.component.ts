import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TokenSharingService } from '@repo/common-auth'
import { PageLayout, PageLayoutService } from '@repo/common-page-layouts'
import { CheckUpdateService } from '@repo/common-services'
import { NgxSonnerToaster } from 'ngx-sonner'
import { ConfirmDialog } from 'primeng/confirmdialog'
import { ConfirmPopup } from 'primeng/confirmpopup'
import { Toast } from 'primeng/toast'
import { LayoutCenteredComponent } from './main/layouts/components/layout-centered/layout-centered.component'
import { LayoutDefaultComponent } from './main/layouts/components/layout-default/layout-default.component'

@Component({
    imports: [
        CommonModule,
        LayoutDefaultComponent,
        LayoutCenteredComponent,
        RouterModule,
        NgxSonnerToaster,
        ConfirmDialog,
        ConfirmPopup,
        Toast,
    ],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    readonly PageLayout = PageLayout
    private tokenSharingService = inject(TokenSharingService)
    layoutService = inject(PageLayoutService)
    checkUpdateService = inject(CheckUpdateService)

    constructor() {
        this.checkUpdateService.checkForUpdates()
        this.tokenSharingService.init()
    }
}
