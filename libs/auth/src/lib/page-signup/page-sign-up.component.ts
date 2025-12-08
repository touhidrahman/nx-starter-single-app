import { NgClass } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AuthPageHeaderComponent, AuthStateService } from '@repo/auth'
import { AuthApiService, JwtService, RegisterFormService, SignupForm } from '@repo/common-auth'
import { SupportWhatsappComponent } from '@repo/common-components'
import {
    GROUP_TYPE_LABEL_VALUE,
    LabelValuePair,
    USER_IDENTIFIER_LABEL_VALUE,
} from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { InvitationTokenPayload } from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { MenuItem } from 'primeng/api'
import { StepsModule } from 'primeng/steps'
import { SignupStepDetailsComponent } from '../sign-up-step-details/sign-up-step-details.component'
import { SignupStepTypeComponent } from '../sign-up-step-type/sign-up-step-type.component'
import { StepperLabelIconComponent } from '../stepper-label-icon/stepper-label-icon.components'
import { UserVerificationStatusCheckService } from '../user-verification-status-check.service'

@Component({
    selector: 'myorg-page-sign-up',
    imports: [
        PrimeModules,
        StepsModule,
        RouterModule,
        ReactiveFormsModule,
        SupportWhatsappComponent,
        AuthPageHeaderComponent,
        StepperLabelIconComponent,
        SignupStepTypeComponent,
        SignupStepDetailsComponent,
    ],
    templateUrl: './page-sign-up.component.html',
    styleUrls: ['./page-sign-up.component.scss'],
    providers: [RegisterFormService],
})
export class PageSignUpComponent implements OnInit {
    private authStateService = inject(AuthStateService)
    private authApiService = inject(AuthApiService)
    private jwtService = inject(JwtService)
    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)
    private alertService = inject(AlertService)
    userVerificationStatusCheckService = inject(UserVerificationStatusCheckService)
    registerFormService = inject(RegisterFormService)

    token = signal('')
    defaultGroupId = ''
    role = ''
    errors = signal<string[]>([])
    isLoading = signal(false)
    selectedGroupType = signal('client')
    disableReferralCodeField = signal<boolean>(false)
    lastBlurredField = signal<'email' | 'phone' | null>(null)
    hasFieldBeenBlurred = signal(false)
    phoneVerificationToken = signal<string | null>(null)
    isBackButtonVisible = signal(false)

    activeStep = 1

    groupTypes: LabelValuePair<string>[] = GROUP_TYPE_LABEL_VALUE
    registrationBy: LabelValuePair<string>[] = USER_IDENTIFIER_LABEL_VALUE

    get signUpForm() {
        return this.registerFormService.form
    }

    ngOnInit(): void {
        this.handleInvitationToken()

        this.signUpForm.patchValue({
            registrationBy: 'email',
        })

        const initialMethod = 'email'
        this.userVerificationStatusCheckService.initSignup(initialMethod)

        this.signUpForm.get('registrationBy')?.valueChanges.subscribe((method) => {
            this.userVerificationStatusCheckService.changeSignupRegistrationMethod(method)
        })
    }

    selectRegistrationMethod(method: string) {
        this.signUpForm.patchValue({
            registrationBy: method,
        })
    }

    register() {
        this.isLoading.set(true)
        if (this.signUpForm.invalid) {
            this.isLoading.set(false)
            return
        }

        const signupInput = this.registerFormService.getValue()
        const userRegistrationData: SignupForm = {
            ...signupInput,
            organization: {
                groupType: this.registerFormService?.groupTypeControl?.value ?? '',
                name: this.registerFormService.nameControl?.value ?? '',
            },
            defaultGroupId: this.defaultGroupId,
            role: this.role,
            email: this.registerFormService.emailControl?.value ?? '',
            phone: this.registerFormService.phoneControl?.value ?? '',
        }

        return this.authStateService.register(userRegistrationData).subscribe({
            next: (res) => {
                this.handleRegistrationRedirect({
                    registeredBy: res.data.registeredBy,
                    token: res.data.token,
                })
            },
            error: (error) => {
                this.isLoading.set(false)
                const errorMessage = this.getErrorMessage(error)
                this.errors.set([errorMessage])
            },
        })
    }

    private handleInvitationToken(): void {
        const token = this.activatedRoute.snapshot.queryParams['token']
        if (!token) return

        const decoded = this.jwtService.getUnexpiredDecoded<InvitationTokenPayload>(token)

        if (decoded) {
            this.processValidInvitation(decoded)
        } else {
            this.alertService.warn('Your invitation has expired!')
        }
    }

    private processValidInvitation(decoded: InvitationTokenPayload): void {
        if (this.authStateService.isLoggedIn()) {
            this.authStateService.logout()
            window.location.reload()
            return
        }

        const { roleId, userEmail, organizationId } = decoded
        this.defaultGroupId = organizationId
        this.role = roleId
        this.activeStep = 2
        this.isBackButtonVisible.set(true)
        setTimeout(() => {
            this.registerFormService.invitedUserAutoFillField(userEmail, roleId)
        }, 0)
    }

    private handleRegistrationRedirect(response: { registeredBy: string; token?: string }) {
        // TODO: Activate commented code when SMS verification is ready
        // if (response.registeredBy === 'email') {
        //     this.router.navigate(['/account-created']);
        // } else {
        //     this.router.navigate([`/verify-phone/${response.token}`]);
        // }
        this.router.navigate(['/login'])
    }

    private getErrorMessage(error: any): string {
        if (error?.error?.message) {
            return error.error.message
        }
        if (typeof error?.error === 'string') {
            return error.error
        }
        if (error?.error?.toString) {
            return error.error.toString()
        }
        return 'Failed to register. Please try again later.'
    }
}
