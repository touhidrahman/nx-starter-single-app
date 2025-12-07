import { Component, inject, signal } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { AuthApiService } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { ForgotPassword } from '../forgot-password.model'
import { ForgotPasswordFormService } from '../forgot-password-form.service'

@Component({
    selector: 'app-page-forgot-password',
    imports: [ReactiveFormsModule, RouterModule, PrimeModules],
    templateUrl: './page-forgot-password.component.html',
    styleUrl: './page-forgot-password.component.scss',
    providers: [ForgotPasswordFormService],
})
export class PageForgotPasswordComponent {
    private authApiService = inject<AuthApiService<unknown, unknown>>(AuthApiService)
    private alertService = inject(AlertService)
    private forgotPasswordFormService = inject(ForgotPasswordFormService)
    private router = inject(Router)

    get forgotPasswordForm(): FormGroup {
        return this.forgotPasswordFormService.form
    }

    get identifierControl() {
        return this.forgotPasswordFormService.identifierControl
    }
    errors = ''

    isError = signal<boolean>(false)
    isLoading = signal<boolean>(false)

    onSubmit(): void {
        this.isLoading.set(true)
        if (this.forgotPasswordForm.valid) {
            const identifier = this.forgotPasswordForm.value.identifier
            this.authApiService.forgotPassword(identifier).subscribe({
                next: (response: ApiResponse<ForgotPassword>) => {
                    if (response.data) {
                        this.alertService.success(
                            response.data.isPhone
                                ? ' Password reset code has been sent to your phone!'
                                : ' Password reset link has been sent to your email!',
                        )

                        this.isLoading.set(false)
                        this.forgotPasswordForm.reset()
                        if (response.data.isPhone) {
                            this.router.navigate([`new-password/${response.data.token}`], {
                                queryParams: {
                                    isPhone: response.data.isPhone,
                                },
                            })
                        } else {
                            this.router.navigate(['/verification-email-sent'], {
                                queryParams: { isReset: true },
                            })
                        }
                    }
                },
                error: (err) => {
                    this.isLoading.set(false)
                    this.alertService.error('Error sending reset link.')

                    const errorMessage =
                        err.error?.message ||
                        err.message ||
                        'An error occurred while sending the reset link.'
                    this.errors = errorMessage
                },
            })
        }
    }
}
