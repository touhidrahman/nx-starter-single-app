import { Injectable } from '@angular/core'
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { UpdateUser, UserStatus } from './user.model'

@Injectable()
export class UserFormService {
    form: FormGroup

    constructor(private fb: NonNullableFormBuilder) {
        const { required } = Validators
        this.form = this.fb.group({
            firstName: [''],
            lastName: [''],
            email: ['', [Validators.email]],
            phone: [''],
            city: [''],
            state: [''],
            country: [''],
            postCode: [''],
            address: [''],
            status: [UserStatus.ACTIVE],
            verified: [false],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: UpdateUser) {
        this.form.patchValue(data)
    }
}
