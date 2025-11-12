import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
    AuthApiService,
    JwtService,
    NewPasswordFormService,
} from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'myorg-new-password',
    standalone: true,
    imports: [ReactiveFormsModule, PrimeModules, FormsModule],
    templateUrl: './new-password.component.html',
    styleUrl: './new-password.component.scss',
    providers: [NewPasswordFormService],
})
export class NewPasswordComponent implements OnInit {
    private authApiService = inject(AuthApiService)
    private router = inject(Router)
    private jwtService = inject(JwtService)
    private activatedRoute = inject(ActivatedRoute)
    readonly newPasswordForm = inject(NewPasswordFormService)
    private alertService = inject(AlertService)

    isLoading = signal<boolean>(false)
    errors = signal<string>('')
    token = signal<string>('')
    email = signal<string>('')
    phone = signal<string>('')
    isPhone = signal<boolean>(false)

    ngOnInit(): void {
        const token = this.activatedRoute.snapshot.params['token']
        const isPhoneParam = this.activatedRoute.snapshot.queryParams['isPhone']
        this.isPhone.set(isPhoneParam)
        if (token) {
            const decoded = this.jwtService.getUnexpiredDecoded<{
                email: string
                phone: string
            }>(token)
            this.email.set(decoded?.email ?? '')
            this.token.set(token)
            this.phone.set(decoded?.phone ?? '')
        }
    }

    onSetNewPassword(event: Event) {
        event.preventDefault()

        if (this.isLoading()) return
        Object.values(this.newPasswordForm.form.controls).forEach((control) => {
            control.markAsTouched()
        })

        if (this.newPasswordForm.form.invalid) {
            this.errors.set('Please fix all form errors')
            return
        }

        this.isLoading.set(true)
        const fromValue: {
            email: string
            phone: string
            code: string
            password: string
        } = {
            email: this.email(),
            phone: this.phone(),
            code: this.newPasswordForm.form.value.code ?? '',
            password: this.newPasswordForm.form.value.password ?? '',
        }
        this.authApiService
            .resetPassword(
                this.token(),
                fromValue.email,
                fromValue.phone,
                fromValue.code,
                fromValue.password,
            )
            .subscribe({
                next: () => {
                    this.isLoading.set(false)
                    this.alertService.success('Password reset successfully.')
                    this.router.navigate(['/password-reset-result'], {
                        queryParams: { status: 'success' },
                    })
                },
                error: (err) => {
                    this.isLoading.set(false)
                    const errorMessage =
                        err.error?.message ||
                        err.message ||
                        'Failed to reset password.'
                    this.errors.set(errorMessage)
                    this.alertService.error('Failed to reset password.')
                },
            })
    }
}
