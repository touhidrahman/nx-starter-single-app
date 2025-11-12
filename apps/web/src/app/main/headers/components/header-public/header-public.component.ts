import { AsyncPipe, CommonModule } from '@angular/common'
import { Component, HostListener, inject, OnInit, signal } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { ProfileStateService } from '@repo/user'
import { publicHeaderData } from '../../header-routes.data'
import { HeaderService } from '../services/header.service'
import { HeaderAuthService } from '../services/header-auth.service'
import { HeaderScrollService } from '../services/header-scroll.service'
import { UserLoginStatusComponent } from '../user-login-status/user-login-satus.component'

@Component({
    selector: 'app-header-public',
    imports: [
        RouterModule,
        PrimeModules,
        AsyncPipe,
        CommonModule,
        UserLoginStatusComponent,
    ],
    templateUrl: './header-public.component.html',
    styleUrl: './header-public.component.scss',
})
export class HeaderPublicComponent implements OnInit {
    readonly scrollService = inject(HeaderScrollService)
    readonly headerAuthService = inject(HeaderAuthService)
    readonly headerService = inject(HeaderService)
    readonly profileStateService = inject(ProfileStateService)
    private router = inject(Router)

    headerRoutesData = publicHeaderData
    activeSection = signal<string>('')

    ngOnInit() {
        this.scrollService.initScrollTracking(this.headerRoutesData)
    }

    @HostListener('window:scroll')
    onScroll() {
        this.scrollService.handleScroll(this.headerRoutesData)
    }

    navigateToHome(): void {
        this.router
            .navigate(['/'], {
                replaceUrl: false,
                queryParams: {},
                fragment: undefined,
            })
            .then(() => {
                document
                    .querySelectorAll('.active-link')
                    .forEach((el) => el.classList.remove('active-link'))

                window.scrollTo({ top: 0, behavior: 'smooth' })
            })
    }

    navigateToFragment(id: string) {
        this.scrollService.navigateToFragment(id, () =>
            this.headerService.closeMenu(),
        )
    }
}
