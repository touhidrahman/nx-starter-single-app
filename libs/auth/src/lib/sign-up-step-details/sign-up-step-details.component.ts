import { NgClass } from '@angular/common'
import { Component, inject, input, OnInit, output, signal } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { RegisterFormService } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { UserIdentifierInputFieldComponent } from '../user-identifier-input-field/user-identifier-input-field'
import { UserVerificationButtonComponent } from '../user-verification-button/user-verification-button.component'
import { UserVerificationStatusCheckService } from '../user-verification-status-check.service'

@Component({
    selector: 'app-sign-up-step-details',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        PrimeModules,
        RouterModule,
        ReactiveFormsModule,
        NgClass,
        UserVerificationButtonComponent,
        UserIdentifierInputFieldComponent,
    ],
    templateUrl: './sign-up-step-details.component.html',
})
export class SignupStepDetailsComponent implements OnInit {
    private alertService = inject(AlertService)
    private activatedRoute = inject(ActivatedRoute)
    protected userVerificationStatusCheckService = inject(
        UserVerificationStatusCheckService,
    )
    protected registerFormService = inject(RegisterFormService)

    registrationBy = input.required<any[]>()
    isLoading = input.required<boolean>()
    isBackButtonVisible = input.required<boolean>()
    back = output<void>()
    register = output<void>()

    isReferral = signal<boolean>(false)
    disableReferralCodeField = signal<boolean>(false)

    ngOnInit(): void {
        this.checkReferralCodeInQueryParam()
    }

    selectRegistrationMethod(value: string) {
        this.registerFormService.form.patchValue({ registrationBy: value })
    }

    onFieldInput() {
        this.userVerificationStatusCheckService.onFieldInput('signup')
    }

    onFieldBlur(field: 'email' | 'phone') {
        const control = this.registerFormService.form.get(field)
        this.userVerificationStatusCheckService.onSignupFieldBlur(
            field,
            control,
        )
    }

    userVerify() {
        const email = this.registerFormService.form.get('email')?.value?.trim()
        const phone = this.registerFormService.form.get('phone')?.value?.trim()
        const value = email || phone
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

    openReferralFiled() {
        this.isReferral.set(!this.isReferral())
    }

    shouldShowVerifyButton(): boolean {
        return this.userVerificationStatusCheckService.shouldShowSignupVerifyButton()
    }

    private checkReferralCodeInQueryParam() {
        const referralCode =
            this.activatedRoute.snapshot.queryParams['referralCode']
        const groupTypeControl = this.registerFormService.form.get(
            'organization.groupType',
        )

        if (groupTypeControl?.value === 'vendor') {
            this.applyReferralCode(referralCode)
        }

        groupTypeControl?.valueChanges.subscribe((value) => {
            if (value === 'vendor') {
                this.applyReferralCode(referralCode)
            } else {
                this.registerFormService.form.patchValue({ referralCode: '' })
                this.disableReferralCodeField.set(false)
            }
        })
    }

    private applyReferralCode(referralCode: string) {
        this.registerFormService.form.patchValue({ referralCode })
        this.disableReferralCodeField.set(true)
    }
}
