import { Injectable } from '@angular/core'
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'

const RegexEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

@Injectable()
export class InvitationFormService {
    form: FormGroup

    constructor(private fb: NonNullableFormBuilder) {
        const { required, pattern, email } = Validators
        this.form = this.fb.group({
            email: ['', [required, email, pattern(RegexEmailPattern)]],
            roleId: ['', [required]],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }
}
