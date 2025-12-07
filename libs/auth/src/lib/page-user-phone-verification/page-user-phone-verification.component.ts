import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthApiService, JwtService } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { maskString } from '@repo/common-util'
import { PrimeModules } from '@repo/prime-modules'
import { UserPhoneVerificationFormService } from '../user-phone-verification-form.service'

@Component({
    selector: 'myorg-page-user-phone-verification',
    imports: [CommonModule, PrimeModules, ReactiveFormsModule],
    templateUrl: './page-user-phone-verification.component.html',
    styleUrl: './page-user-phone-verification.component.css',
    providers: [UserPhoneVerificationFormService],
})
export class PageUserPhoneVerificationComponent implements OnInit {
    private authApiService = inject(AuthApiService)
    private alertService = inject(AlertService)
    private activatedRoute = inject(ActivatedRoute)
    private router = inject(Router)
    private jwtService = inject(JwtService)
    verifyUserFormService = inject(UserPhoneVerificationFormService)

    isError = signal<boolean>(false)
    isLoading = signal<boolean>(false)
    secretPhone = signal<string>('')

    get verifyUserForm() {
        return this.verifyUserFormService.form
    }

    ngOnInit(): void {
        const token = this.activatedRoute.snapshot.paramMap.get('token')
        const decodedToken = this.jwtService.getUnexpiredDecoded<{
            sub: string
        }>(token ?? '')
        const makeSecretPhoneNumber = maskString(decodedToken?.sub ?? '', 3, 2)
        this.secretPhone.set(makeSecretPhoneNumber)
        this.verifyUserFormService.phoneControl?.setValue(makeSecretPhoneNumber)
        this.verifyUserFormService.phoneControl?.disable()
    }

    verifyUser(event: Event) {
        event.preventDefault()
        this.isLoading.set(true)
        const phoneVerificationData = this.verifyUserFormService.getValue()

        this.authApiService
            .verifyPhone({
                ...phoneVerificationData,
                token: this.activatedRoute.snapshot.paramMap.get('token') ?? '',
                verificationCode: +this.verifyUserForm.get('verificationCode')?.value,
            })
            .subscribe({
                next: () => {
                    this.isLoading.set(false)
                    this.isError.set(false)
                    this.alertService.success('Phone number verified successfully.')
                    this.verifyUserForm.reset()
                    this.router.navigate(['/login'])
                },
                error: () => {
                    this.isLoading.set(false)
                    this.isError.set(true)
                    this.alertService.error('Failed to verify phone number.')
                },
            })
    }
}
