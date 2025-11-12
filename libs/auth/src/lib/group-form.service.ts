import { Injectable, inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { GroupInput, GroupStatus } from '@repo/common-auth'

@Injectable()
export class GroupFormService {
    private fb = inject(FormBuilder)
    form: FormGroup = this.buildForm()

    buildForm(): FormGroup {
        return this.fb.nonNullable.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            address: [''],
            phone: [''],
            city: [''],
            country: [''],
            postCode: [''],
            type: ['', [Validators.required]],
            status: [GroupStatus.active],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue(): GroupInput {
        return this.form.value as GroupInput
    }
}
