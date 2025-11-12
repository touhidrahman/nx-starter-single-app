import { Injectable } from '@angular/core'
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { Group } from '@repo/common-auth'

@Injectable({ providedIn: 'root' })
export class GroupFormService {
    form: FormGroup

    constructor(private fb: NonNullableFormBuilder) {
        this.form = this.buildForm()
    }

    buildForm() {
        const { required } = Validators

        return this.fb.group({
            name: ['', [required]],
            ownerId: [''],
            email: ['', [required]],
            address: [''],
            phone: ['', [required]],
            postCode: [''],
            city: [''],
            country: [''],
            state: [''],
            type: ['', [required]],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: Group) {
        this.form.patchValue(data)
    }
}
