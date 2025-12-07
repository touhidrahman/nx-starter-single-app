import { Component, inject, OnInit } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { AuthApiService } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-account-verify',
    imports: [RouterModule, PrimeModules],
    templateUrl: './page-account-verify.component.html',
    styleUrl: './page-account-verify.component.scss',
})
export class PageAccountVerifyComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute)
    private authApiService = inject(AuthApiService)
    private alertService = inject(AlertService)

    token = ''
    isVerified = false
    alreadyVerified = false
    isLoading = true

    ngOnInit(): void {
        const url = this.activatedRoute.snapshot.paramMap.get('token')
        this.token = url ?? ''
        this.verifyEmail()
    }

    verifyEmail() {
        this.authApiService.verifyEmail(this.token).subscribe({
            next: (response) => {
                this.isLoading = false
                if (response.message === 'Email has already been verified') {
                    this.alreadyVerified = true
                    this.alertService.warn(response.message ?? '')
                } else {
                    this.isVerified = !!response?.data?.id
                    this.alertService.success(response.message ?? '')
                }
            },
            error: (_error) => {
                this.isLoading = false
                this.alertService.error('An error occurred during verification.')
            },
        })
    }
}
