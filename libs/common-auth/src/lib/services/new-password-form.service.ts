import { Injectable } from '@angular/core'
import {
    AbstractControl,
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms'
import { NewPassword } from '../models/new-password'

type NewPasswordForm = {
    [field in keyof NewPassword]: FormControl<NewPassword[field]>
}

const Regex8CharsSmallCapitalDigitSpecial =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/

@Injectable()
export class NewPasswordFormService {
    form: FormGroup<NewPasswordForm>

    constructor(private fb: NonNullableFormBuilder) {
        const { required, minLength, maxLength, pattern } = Validators
        this.form = this.fb.group(
            {
                code: ['', [maxLength(6), minLength(6)]],
                password: [
                    '',
                    [
                        required,
                        minLength(6),
                        maxLength(32),
                        pattern(Regex8CharsSmallCapitalDigitSpecial),
                    ],
                ],
                confirmPassword: ['', [required]],
            },
            { validators: this.passwordMatchValidator },
        )
    }

    private passwordMatchValidator: ValidatorFn = (
        control: AbstractControl,
    ): ValidationErrors | null => {
        const password = control.get('password')
        const confirmPassword = control.get('confirmPassword')

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true })
            return { passwordMismatch: true }
        }
        confirmPassword?.setErrors(null)
        return null
    }

    getValue(): NewPassword {
        return this.form.getRawValue()
    }

    patchForm(data: Partial<NewPassword>) {
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
