import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'myorg-password-reset-result',
    imports: [PrimeModules],
    templateUrl: './password-reset-result.component.html',
    styleUrl: './password-reset-result.component.css',
})
export class PasswordResetResultComponent {
    status: 'success' | 'failed' = 'success'

    constructor(
        route: ActivatedRoute,
        private router: Router,
    ) {
        route.queryParams.subscribe((params) => {
            this.status = params['status'] || 'success'
        })
    }
    navigateTo(path: string) {
        this.router.navigate([path])
    }
}
