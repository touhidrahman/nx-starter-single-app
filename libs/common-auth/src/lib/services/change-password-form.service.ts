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

import { ChangePasswordInput } from '../models/change-password-input'

type ChangePasswordForm = {
    [field in keyof ChangePasswordInput]: FormControl<
        ChangePasswordInput[field]
    >
}

const Regex8CharsSmallCapitalDigitSpecial =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{6,}$/

@Injectable()
export class ChangePasswordFormService {
    form: FormGroup<ChangePasswordForm>

    constructor(private fb: NonNullableFormBuilder) {
        const { required, minLength, maxLength, pattern } = Validators

        this.form = this.fb.group(
            {
                currentPassword: [
                    '',
                    [
                        required,
                        minLength(8),
                        maxLength(32),
                        pattern(Regex8CharsSmallCapitalDigitSpecial),
                    ],
                ],
                password: [
                    '',
                    [
                        required,
                        minLength(8),
                        maxLength(32),
                        pattern(Regex8CharsSmallCapitalDigitSpecial),
                    ],
                ],
                passwordConfirmation: ['', [required]],
            },
            {
                validators: [
                    this.confirmPasswordValidator,
                    this.newPasswordDifferentValidator,
                ],
            },
        )
    }

    private confirmPasswordValidator: ValidatorFn = (
        control: AbstractControl,
    ): ValidationErrors | null => {
        return control.value.password === control.value.passwordConfirmation
            ? null
            : { passwordNotMatched: true }
    }

    private newPasswordDifferentValidator: ValidatorFn = (
        control: AbstractControl,
    ): ValidationErrors | null => {
        const currentPassword = control.get('currentPassword')?.value
        const newPassword = control.get('password')?.value

        return currentPassword && newPassword && currentPassword === newPassword
            ? { sameAsCurrent: true }
            : null
    }

    getValue(): ChangePasswordInput {
        return this.form.value as ChangePasswordInput
    }

    get currentPassword() {
        return this.form.get('currentPassword')
    }

    get password() {
        return this.form.get('password')
    }

    get passwordConfirmation() {
        return this.form.get('passwordConfirmation')
    }
}
