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
import { AdminSignupInput, SignupInput } from '../models/signup-input'

type RegisterForm = {
    [field in keyof AdminSignupInput]: FormControl<AdminSignupInput[field]>
}

const RegexEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const Regex8CharsSmallCapitalDigitSpecial = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{6,}$/

@Injectable()
export class AdminRegisterFormService {
    form: FormGroup<RegisterForm>

    constructor(private fb: NonNullableFormBuilder) {
        const { required, minLength, maxLength, pattern, email } = Validators
        this.form = this.fb.group(
            {
                name: ['', required],
                email: ['', [required, email, pattern(RegexEmailPattern)]],
                password: [
                    '',
                    [
                        required,
                        minLength(8),
                        maxLength(32),
                        pattern(Regex8CharsSmallCapitalDigitSpecial),
                    ],
                ],
                confirmPassword: ['', [required]],
            },
            { validators: confirmPasswordValidator },
        )

        this.form.get('password')?.valueChanges.subscribe(() => {
            this.form.get('confirmPassword')?.updateValueAndValidity()
        })
    }

    getValue(): AdminSignupInput {
        return this.form.value as AdminSignupInput
    }
    patchForm(data: SignupInput) {
        this.form.patchValue(data)
    }
}

const confirmPasswordValidator: ValidatorFn = (
    control: AbstractControl,
): ValidationErrors | null => {
    const password = control.get('password')
    const confirmPassword = control.get('confirmPassword')

    if (!password || !confirmPassword) return null

    if (confirmPassword.errors && !confirmPassword.errors['passwordNotMatched']) {
        return null // Keep other existing errors
    }

    if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordNotMatched: true })
    } else {
        confirmPassword.setErrors(null)
    }

    return null
}
