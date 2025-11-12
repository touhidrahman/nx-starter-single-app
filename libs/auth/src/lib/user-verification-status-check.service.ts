import { Injectable, inject, signal } from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthApiService } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { resendVerification } from 'libs/common-auth/src/lib/models/resend-verification'
import { Observable, of, tap } from 'rxjs'
import { UserVerificationStatusCheck } from './user-verification-status-check.model'

@Injectable({
    providedIn: 'root',
})
export class UserVerificationStatusCheckService {
    private authApiService = inject(AuthApiService)
    private router = inject(Router)

    isEmail = signal(false)
    isChecking = signal(false)
    showVerifyButton = signal(false)
    isSendingVerification = signal(false)
    verificationToken = signal<string | null>(null)

    private states = {
        login: {
            shouldVerify: signal(false),
            lastBlurredField: signal<'identifier' | null>(null),
            hasFieldBeenBlurred: signal(false),
        },
        signup: {
            shouldVerify: signal(false),
            lastBlurredField: signal<'email' | 'phone' | null>(null),
            hasFieldBeenBlurred: signal(false),
            registrationMethod: signal<'email' | 'phone' | null>(null),
        },
    }

    initSignup(registrationMethod: 'email' | 'phone') {
        this.states.signup.registrationMethod.set(registrationMethod)
        this.resetSignupVerification()
    }

    initLogin() {
        this.resetLoginVerification()
    }

    onLoginFieldBlur(control: AbstractControl | null) {
        if (!control) return

        const value = control.value?.trim()
        const isValid = control.valid

        if (value && isValid) {
            this.states.login.lastBlurredField.set('identifier')
            this.states.login.hasFieldBeenBlurred.set(true)
            this.checkIdentifier(value)
        } else {
            this.states.login.shouldVerify.set(false)
            this.showVerifyButton.set(false)
        }
    }

    onSignupFieldBlur(
        field: 'email' | 'phone',
        control: AbstractControl | null,
    ) {
        if (!control) return

        const value = control.value?.trim()
        const isValid = control.valid

        if (value && isValid) {
            this.states.signup.lastBlurredField.set(field)
            this.states.signup.hasFieldBeenBlurred.set(true)
            this.checkIdentifier(value)
        } else {
            this.states.signup.shouldVerify.set(false)
            this.showVerifyButton.set(false)
        }
    }

    onFieldInput(component: 'login' | 'signup') {
        this.states[component].hasFieldBeenBlurred.set(false)
        this.states[component].shouldVerify.set(false)
        this.showVerifyButton.set(false)
    }

    resetLoginVerification() {
        this.states.login.shouldVerify.set(false)
        this.states.login.lastBlurredField.set(null)
        this.states.login.hasFieldBeenBlurred.set(false)
        this.showVerifyButton.set(false)
    }

    resetSignupVerification() {
        this.states.signup.shouldVerify.set(false)
        this.states.signup.lastBlurredField.set(null)
        this.states.signup.hasFieldBeenBlurred.set(false)
        this.showVerifyButton.set(false)
    }

    changeSignupRegistrationMethod(method: 'email' | 'phone') {
        this.states.signup.registrationMethod.set(method)
        this.resetSignupVerification()
    }

    shouldShowLoginVerifyButton(): boolean {
        const state = this.states.login

        if (!state.hasFieldBeenBlurred() || !state.lastBlurredField()) {
            return false
        }

        return state.shouldVerify() && this.showVerifyButton()
    }

    shouldShowSignupVerifyButton(): boolean {
        const state = this.states.signup

        if (!state.hasFieldBeenBlurred() || !state.lastBlurredField()) {
            return false
        }

        const registrationMethod = state.registrationMethod()
        const lastBlurredField = state.lastBlurredField()

        return (
            state.shouldVerify() &&
            this.showVerifyButton() &&
            registrationMethod === lastBlurredField
        )
    }

    checkIdentifier(identifier: string) {
        this.showVerifyButton.set(false)

        if (!identifier?.trim()) return

        this.isChecking.set(true)
        this.authApiService.checkUserVerificationStatus(identifier).subscribe({
            next: (res: ApiResponse<UserVerificationStatusCheck>) => {
                const { isVerified, canVerify, isEmail } = res.data
                this.isEmail.set(isEmail)
                if (canVerify) {
                    this.showVerifyButton.set(true)
                    this.states.login.shouldVerify.set(true)
                    this.states.signup.shouldVerify.set(true)
                } else {
                    this.showVerifyButton.set(false)
                    this.states.login.shouldVerify.set(false)
                    this.states.signup.shouldVerify.set(false)
                }
            },
            error: () => {
                this.showVerifyButton.set(false)
                this.states.login.shouldVerify.set(false)
                this.states.signup.shouldVerify.set(false)
                this.isChecking.set(false)
            },
            complete: () => this.isChecking.set(false),
        })
    }

    resendVerification(
        identifier: string,
    ): Observable<ApiResponse<resendVerification>> {
        if (!identifier?.trim()) {
            return of()
        }

        this.isSendingVerification.set(true)

        return this.authApiService.resendVerification(identifier).pipe(
            tap({
                next: (res: ApiResponse<resendVerification>) => {
                    this.handleVerificationRedirect(res.data)
                },
                error: (error) => {
                    console.error('Resend verification failed', error)
                },
                finalize: () => {
                    this.isSendingVerification.set(false)
                },
            }),
        )
    }

    getCurrentFieldType(): string {
        return this.isEmail() ? 'email' : 'phone number'
    }

    private handleVerificationRedirect(response: {
        token: string
        isEmail: boolean
    }) {
        const isEmail = response.isEmail
        if (isEmail) {
            this.router.navigate(['/verification-email-sent'])
        } else {
            this.router.navigate([`/verify-phone/${response.token}`])
        }
    }
}
