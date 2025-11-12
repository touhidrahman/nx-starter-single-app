import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { LoginFormService } from '@repo/common-auth'
import { SupportWhatsappComponent } from '@repo/common-components'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { UserLevel } from '@repo/user'
import { UserSettingStateService } from '@repo/user-setting'
import { WA_LOCATION } from '@ng-web-apis/common'
import { AuthStateService } from '../auth-state.service'
import { UserVerificationButtonComponent } from '../user-verification-button/user-verification-button.component'
import { UserVerificationStatusCheckService } from '../user-verification-status-check.service'

@Component({
    selector: 'myorg-page-login',
    imports: [
        PrimeModules,
        ReactiveFormsModule,
        RouterModule,
        SupportWhatsappComponent,
        UserVerificationButtonComponent,
    ],
    templateUrl: './page-login.component.html',
    styleUrl: './page-login.component.scss',
    providers: [LoginFormService],
})
export class PageLoginComponent implements OnInit {
    private authStateService = inject(AuthStateService)
    private userSettingStateService = inject(UserSettingStateService)
    private activatedRoute = inject(ActivatedRoute)
    private router = inject(Router)
    private returnUrl = ''
    userVerificationStatusCheckService = inject(
        UserVerificationStatusCheckService,
    )
    private alertService = inject(AlertService)
    private readonly location = inject(WA_LOCATION)
    loginFormService = inject(LoginFormService)

    isLoading = signal<boolean>(false)
    errors = signal<string>('')

    ngOnInit(): void {
        this.returnUrl =
            this.activatedRoute.snapshot.queryParams['returnUrl'] ??
            '/dashboard/home'

        if (this.authStateService.isLoggedIn())
            this.router.navigateByUrl(this.returnUrl)
        this.userVerificationStatusCheckService.initLogin()

        if (this.authStateService.isLoggedIn()) {
            this.router.navigateByUrl(this.returnUrl)
        }
    }

    onFieldInput() {
        this.userVerificationStatusCheckService.onFieldInput('login')
    }

    onFieldBlur() {
        const control = this.loginFormService.form.get('identifier')
        this.userVerificationStatusCheckService.onLoginFieldBlur(control)
    }

    shouldShowVerifyButton(): boolean {
        return this.userVerificationStatusCheckService.shouldShowLoginVerifyButton()
    }

    userVerify() {
        const value = this.loginFormService.form
            .get('identifier')
            ?.value?.trim()
        if (value) {
            this.userVerificationStatusCheckService
                .resendVerification(value)
                .subscribe({
                    error: (err) => {
                        const errorMessage =
                            err.error?.message ||
                            err.message ||
                            'Failed to send verification mail / code. Please try again.'

                        this.alertService.error(errorMessage)
                    },
                })
        }
    }

    submit(): void {
        this.isLoading.set(true)
        this.errors.set('')

        if (this.loginFormService.form.invalid) {
            this.errors.set('Invalid Credentials')
            return
        }

        const { identifier, password } = this.loginFormService.getValue()
        this.authStateService.login(identifier ?? '', password).subscribe({
            next: () => {
                this.isLoading.set(false)
                this.redirectAfterLogin()
                this.userSettingStateService.init()
            },
            error: (err) => {
                this.isLoading.set(false)
                if (err.error?.data?.redirect && err.error.data.url) {
                    window.location.href = err.error.data.url
                    return
                }
                const errorMessage =
                    err.error?.message ||
                    err.message ||
                    'Login failed. Please try again.'

                this.errors.set(errorMessage)
            },
        })
    }

    private redirectAfterLogin(): void {
        const { tokenPayload } = this.authStateService.getState()
        if (!tokenPayload?.groupId && tokenPayload?.level !== UserLevel.Admin) {
            this.router.navigateByUrl('/create-profile')
            return
        }

        if (tokenPayload.groupType === 'client') {
            this.router.navigateByUrl('/dashboard/home/client').then(() => {
                this.location.reload()
            })
            return
        }

        if (tokenPayload?.groupType === 'vendor') {
            this.router.navigateByUrl('/dashboard/home').then(() => {
                this.location.reload()
            })
            return
        }
        this.router.navigateByUrl(this.returnUrl || '/dashboard/home')
    }
}
