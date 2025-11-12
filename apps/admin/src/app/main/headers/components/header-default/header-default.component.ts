import { AsyncPipe } from '@angular/common'
import {
    Component,
    EventEmitter,
    inject,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    signal,
} from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { ProfileStateService } from '@repo/user'
import { AdminAuthStateService } from 'libs/auth/src/lib/admin-auth-state.service'
import { HeaderUtilService } from '../../header-utils/header-util.service'

@Component({
    selector: 'app-header-default',
    imports: [RouterModule, PrimeModules, AsyncPipe],
    templateUrl: './header-default.component.html',
    styleUrl: './header-default.component.scss',
})
export class HeaderDefaultComponent implements OnInit, OnDestroy {
    readonly adminAuthSateService = inject(AdminAuthStateService)
    readonly profileStateService = inject(ProfileStateService)

    isVisibleDropDown = signal<boolean>(false)

    router = inject(Router)
    renderer: Renderer2 = inject(Renderer2)
    headerUtilService = inject(HeaderUtilService)
    bodyClickListener: (() => void) | null = null

    @Output() sidebarToggle = new EventEmitter<void>()

    toggleSidebar() {
        this.sidebarToggle.emit()
    }

    ngOnInit() {
        // this.bodyClickListener = this.renderer.listen(
        //     document,
        //     'click',
        //     (e: Event) => {
        //         this.headerUtilService.toggleProfileMenu(e, this.uiState)
        //     },
        // )
        // const user = JSON.parse(this.localStorageService.getItem('user') ?? '')
        //! TODO: Fix Error ,don't remove commented code
        // this.authState.setState({
        //     user,
        //     isLoggedIn: user ? true : false,
        // })
    }

    // uiState: UIstate = {
    //     imageLoaded: true,
    //     showProfileDropDown: false,
    // }
    // showFallback(event: Event) {
    //     this.headerUtilService.showFallbackText(event, this.uiState)
    // }

    openProfileDropDown() {
        this.isVisibleDropDown.set(!this.isVisibleDropDown())
    }
    // toggle profile menu logic
    ngOnDestroy() {
        if (this.bodyClickListener) {
            this.bodyClickListener()
            this.bodyClickListener = null
        }
    }
}
