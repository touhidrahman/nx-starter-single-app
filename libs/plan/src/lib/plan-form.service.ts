import { Injectable } from '@angular/core'
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { integerValidator } from '@repo/common-util'
import { Plan } from './plan.model'

@Injectable()
export class PlanFormService {
    form: FormGroup

    constructor(private fb: NonNullableFormBuilder) {
        const { required } = Validators
        this.form = this.fb.group({
            name: ['', [required]],
            description: [''],
            monthlyPrice: [0, [required, integerValidator()]],
            yearlyPrice: [0, [required, integerValidator()]],
            discountPrice: [0, [integerValidator()]],
            discountPeriodStart: [null],
            discountPeriodEnd: [null],
            currency: ['BDT'],
            isActive: [true],
            maxCauselistEnrollment: [0, [required, integerValidator()]],
            storageLimit: [0, [required, integerValidator()]],
            maxUsers: [0, [required, integerValidator()]],
            maxCases: [0, [required, integerValidator()]],
            monthlySmsLimit: [0, [required, integerValidator()]],
            monthlyAiCredits: [0, [required, integerValidator()]],
            activeFeatures: [''],
            inactiveFeatures: [''],
            trialPeriodDays: [0, [integerValidator()]],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: Plan) {
        this.form.patchValue(data)
    }
}
