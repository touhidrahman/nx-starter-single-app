import { CommonModule } from '@angular/common'
import { Component, inject, input, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { AlertService } from '@repo/common-services'
import { formattedDate } from '@repo/common-util'
import { PrimeModules } from '@repo/prime-modules'
import { GroupStateService } from '@repo/group'
import { PlanStateService } from '@repo/plan'
import {
    Subscription,
    SubscriptionDto,
    SubscriptionFormService,
    SubscriptionStatus,
    SubscriptionsApiService,
    SubscriptionType,
} from '@repo/subscription'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-create-subscription',
    imports: [CommonModule, PrimeModules, ReactiveFormsModule],
    templateUrl: './create-subscription.component.html',
    styleUrl: './create-subscription.component.scss',
    providers: [SubscriptionFormService, PlanStateService],
})
export class CreateSubscriptionComponent implements OnInit {
    private groupStateService = inject(GroupStateService)
    private subscriptionFormService = inject(SubscriptionFormService)
    private subscriptionsApiService = inject(SubscriptionsApiService)
    private alertService = inject(AlertService)
    private ref = inject(DynamicDialogRef)
    private config = inject(DynamicDialogConfig)

    planStateService = inject(PlanStateService)

    subscriptionTypes = Object.values(SubscriptionType)
    subscriptionStatus = Object.values(SubscriptionStatus)
    paymentMethods = ['card', 'bKash', 'cash']
    group = this.groupStateService.getState().group

    groupId = input<string>('')
    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)

    ngOnInit() {
        this.planStateService.init()
        if (this.config.data) {
            this.patchFormWithConfigData()
        }
    }

    get form() {
        return this.subscriptionFormService.form
    }

    onSubmit(event: Event) {
        this.isLoading.set(true)
        event?.preventDefault()
        if (this.form.invalid) {
            return
        }
        const groupId = this.group?.id || ''
        const data = this.subscriptionFormService.form.getRawValue()
        const date = formattedDate(data.statusChangeDate)

        const formData = {
            ...data,
            statusChangeDate: date,
            groupId,
        }

        if (this.config.data) {
            this.update(formData)
        } else {
            this.create(formData)
        }
    }

    create(data: SubscriptionDto) {
        this.isLoading.set(true)
        this.subscriptionsApiService.create(data).subscribe({
            next: ({ data }) => {
                this.alertService.success('Subscription created!')
                this.isLoading.set(false)
                this.ref?.close(data)
            },
            error: (err) => {
                this.alertService.error(err.error.message)
                this.isLoading.set(false)
                this.isError.set(true)
                this.ref?.close()
            },
        })
    }

    update(data: SubscriptionDto) {
        this.isLoading.set(true)
        this.subscriptionsApiService.update(this.config.data.id, data).subscribe({
            next: ({ data }) => {
                this.alertService.success('Subscription updated!')
                this.isLoading.set(false)
                this.ref?.close(data)
            },
            error: (err) => {
                this.alertService.error(err.error.message)
                this.isLoading.set(false)
                this.isError.set(true)
                this.ref?.close()
            },
        })
    }

    private patchFormWithConfigData(): void {
        //! TODO: if we have real data like auto payment then we can remove this
        const patchData: Subscription = {
            ...this.config.data,
            statusChangeDate: this.config.data.statusChangeDate || new Date(),
            paymentMethod: this.config.data.paymentMethod || 'bKash',
            transactionId: this.config.data.transactionId || '0000000000',
            paymentNumber: this.config.data.paymentNumber || '01300000000',
        }

        this.subscriptionFormService.form.patchValue(patchData)
    }
}
