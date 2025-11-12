import { Injectable, inject } from '@angular/core'
import {
    AbstractControl,
    FormGroup,
    NonNullableFormBuilder,
    Validators,
} from '@angular/forms'
import { UserPhoneVerification } from './user-phone-verification.model'

@Injectable()
export class UserPhoneVerificationFormService {
    private phonePattern = /^(?:\+88|88)?(01[3-9]\d{8})$/
    private codePattern = /^[0-9]{6}$/
    private fb = inject(NonNullableFormBuilder)
    form = this.buildForm()

    buildForm(): FormGroup {
        const { required, minLength, maxLength, pattern, email } = Validators
        const form = this.fb.group({
            verificationCode: [
                '',
                [
                    required,
                    minLength(6),
                    maxLength(6),
                    pattern(this.codePattern),
                ],
            ],
            phone: ['', [pattern(this.phonePattern)]],
        })

        return form
    }

    get phoneControl(): AbstractControl | null {
        return this.form.get('phone')
    }

    get verificationCodeControl(): AbstractControl | null {
        return this.form.get('verificationCode')
    }

    getValue(): UserPhoneVerification {
        return this.form.value as UserPhoneVerification
    }

    patchForm(data: UserPhoneVerification) {
        this.form.patchValue(data)
    }
}
