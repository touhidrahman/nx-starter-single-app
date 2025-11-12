import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { AuthStateService } from '../auth-state.service'

@Component({
    selector: 'myorg-page-profile-created',
    imports: [PrimeModules, RouterLink],
    templateUrl: './page-profile-created.component.html',
    styleUrl: './page-profile-created.component.scss',
})
export class PageProfileCreatedComponent {
    private authStateService = inject(AuthStateService)

    goToLogin() {
        this.authStateService.logout('/login')
    }
}
