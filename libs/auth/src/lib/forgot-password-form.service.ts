import { Injectable, inject } from '@angular/core'
import {
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    Validators,
} from '@angular/forms'
import { identifierValidator } from '@repo/common-util'

@Injectable()
export class ForgotPasswordFormService {
    private fb = inject(NonNullableFormBuilder)

    form: FormGroup

    constructor() {
        this.form = this.buildForm()
    }

    private buildForm(): FormGroup {
        return this.fb.group({
            identifier: new FormControl('', {
                validators: [Validators.required, identifierValidator],
            }),
        })
    }

    get identifierControl(): FormControl<string> {
        return this.form.get('identifier') as FormControl<string>
    }
}
