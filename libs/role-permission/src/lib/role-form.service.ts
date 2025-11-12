import { Injectable } from '@angular/core'
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { Role } from './role.model'

@Injectable()
export class RoleFormService {
    form: FormGroup

    constructor(private fb: NonNullableFormBuilder) {
        const { required } = Validators
        this.form = this.fb.group({
            name: ['', [required]],
            description: [''],
            groupId: [''],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: Role) {
        this.form.patchValue(data)
    }
}
