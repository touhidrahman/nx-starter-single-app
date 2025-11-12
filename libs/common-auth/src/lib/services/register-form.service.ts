import { Injectable, inject } from '@angular/core'
import {
    AbstractControl,
    FormGroup,
    NonNullableFormBuilder,
    Validators,
} from '@angular/forms'
import {
    Regex8CharsSmallCapitalDigitSpecial,
    RegexBangladeshPhone,
    RegexEmailPattern,
} from '@repo/common-util'
import { SignupForm } from '../models/signup-input'

// type RegisterForm = {
//     [field in keyof SignupForm]: FormControl<SignupForm[field]>
// }

@Injectable()
export class RegisterFormService {
    private fb = inject(NonNullableFormBuilder)
    form = this.buildForm()

    buildForm(): FormGroup {
        const { required, minLength, maxLength, pattern, email } = Validators
        const form = this.fb.group({
            firstName: ['', required],
            lastName: ['', required],
            email: [''],
            phone: [''],
            password: [
                '',
                [
                    required,
                    minLength(6),
                    maxLength(32),
                    pattern(Regex8CharsSmallCapitalDigitSpecial),
                ],
            ],
            acceptTerms: [false, Validators.requiredTrue],
            registrationBy: ['', required],
            referralCode: [''],
            organization: this.fb.group({
                groupType: ['', required],
                name: [''],
            }),
        })

        form.get('registrationBy')?.valueChanges.subscribe((registrationBy) => {
            const emailControl = form.get('email')
            const phoneControl = form.get('phone')
            const nameControl = form.get('organization.name')
            emailControl?.clearValidators()
            phoneControl?.clearValidators()

            if (registrationBy === 'email') {
                emailControl?.setValidators([
                    required,
                    email,
                    pattern(RegexEmailPattern),
                ])
                phoneControl?.setValidators(null)
                phoneControl?.setValue('')
            } else if (registrationBy === 'phone') {
                phoneControl?.setValidators([
                    required,
                    pattern(RegexBangladeshPhone),
                ])
                emailControl?.setValidators(null)
                emailControl?.setValue('')
            }

            if (registrationBy === 'email') {
                nameControl?.setValidators([required])
            } else {
                nameControl?.clearValidators()
            }

            emailControl?.updateValueAndValidity()
            phoneControl?.updateValueAndValidity()
            nameControl?.updateValueAndValidity()
        })

        form.get('organization.groupType')?.valueChanges.subscribe(
            (groupType) => {
                const nameControl = form.get('organization.name')

                if (groupType === 'vendor') {
                    nameControl?.setValidators([required])
                } else {
                    nameControl?.clearValidators()
                }

                nameControl?.updateValueAndValidity()
            },
        )

        return form
    }

    public invitedUserAutoFillField(email: string, roleId: string): void {
        this.form.patchValue({
            email: email,
            role: roleId,
        })

        this.emailControl?.disable()
        this.registrationBy?.setValue('email')
        this.groupTypeControl?.setValue('client')
        this.registrationBy?.disable()
        this.groupTypeControl?.clearValidators()
        this.groupTypeControl?.updateValueAndValidity()
        this.groupTypeControl?.disable()
        this.nameControl?.disable()
    }

    get phoneControl(): AbstractControl | null {
        return this.form.get('phone')
    }

    get emailControl(): AbstractControl | null {
        return this.form.get('email')
    }

    get registrationBy(): AbstractControl | null {
        return this.form.get('registrationBy')
    }
    get organization(): AbstractControl | null {
        return this.form.get('organization')
    }
    get groupTypeControl(): AbstractControl | null {
        return this.form.get('organization.groupType')
    }

    get nameControl(): AbstractControl | null {
        return this.form.get('organization.name')
    }

    getValue(): SignupForm {
        return this.form.value as SignupForm
    }

    patchForm(data: SignupForm) {
        this.form.patchValue(data)
    }

    hasLowerCase(str: string): boolean {
        return /[a-z]/.test(str)
    }

    hasUpperCase(str: string): boolean {
        return /[A-Z]/.test(str)
    }

    hasNumber(str: string): boolean {
        return /\d/.test(str)
    }

    hasSpecialChar(str: string): boolean {
        return /[!@#$%^&*]/.test(str)
    }

    hasInvalidSpecialChar(str: string): boolean {
        return /[^A-Za-z\d!@#$%^&*]/.test(str)
    }
}

//TODO: match password
// const confirmPasswordValidator: ValidatorFn = (
//     control: AbstractControl,
// ): ValidationErrors | null => {
//     return control.value.password === control.value.passwordConfirmation
//         ? null
//         : { passwordNotMatched: true }
// }
