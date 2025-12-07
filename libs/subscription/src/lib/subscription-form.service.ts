import { Injectable } from '@angular/core'
import { AbstractControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { RegexBangladeshPhone } from '@repo/common-util'
import { SubscriptionDto } from '@repo/subscription'

@Injectable()
export class SubscriptionFormService {
    form: FormGroup

    constructor(private fb: NonNullableFormBuilder) {
        const { required, pattern, requiredTrue, maxLength, minLength, min } = Validators
        this.form = this.fb.group({
            planId: [''],
            isTrial: [false],
            autoRenewal: [false],
            paymentMethod: ['bKash', [required]],
            paymentNumber: ['', [required, pattern(RegexBangladeshPhone)]],
            transactionId: ['', [required, maxLength(10), minLength(10)]],
            usedStorage: [0, [min(0)]],
            status: ['inactive'],
            subscriptionType: ['monthly', [required]],
            statusChangeDate: [null],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: SubscriptionDto) {
        this.form.patchValue(data)
    }

    get phoneControl(): AbstractControl | null {
        return this.form.get('paymentNumber')
    }
}
