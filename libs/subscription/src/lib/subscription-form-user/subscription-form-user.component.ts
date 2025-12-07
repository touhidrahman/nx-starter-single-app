import { CommonModule } from '@angular/common'
import { Component, inject, input, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { AuthStateService } from '@repo/auth'
import { Plan } from '@repo/plan'
import { SubscriptionFormService } from '../subscription-form.service'
import { SubscriptionsApiService } from '../subscriptions-api.service'

@Component({
    selector: 'app-subscription-form-user',
    imports: [CommonModule, PrimeModules, ReactiveFormsModule],
    templateUrl: './subscription-form-user.component.html',
    styleUrl: './subscription-form-user.component.css',
    providers: [SubscriptionFormService],
})
export class SubscriptionFormUserComponent implements OnInit {
    private subscriptionApiService = inject(SubscriptionsApiService)
    private alertService = inject(AlertService)
    private authStateService = inject(AuthStateService)
    readonly subscriptionFormService = inject(SubscriptionFormService)
    subscribePlan = input<Plan | null>(null)
    subscriptionTypes = input<'yearly' | 'monthly'>('monthly')

    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)

    ngOnInit(): void {
        const subscriptionTypeControl = this.subscriptionFormService.controls('subscriptionType')

        if (subscriptionTypeControl) {
            subscriptionTypeControl.setValue(this.subscriptionTypes() ?? 'monthly')
            subscriptionTypeControl.disable()
        }
    }

    onSubmit(event: Event) {
        // this.isLoading.set(true)
        event.preventDefault()
        const formValue = this.subscriptionFormService.getValue()
        const subscriptionDetails = {
            ...formValue,
            planId: this.subscribePlan()?.id,
            usedStorage: 0,
            status: 'pending',
            groupId: this.authStateService.getGroupId(),
        }
        this.subscriptionApiService.createSubscriptionsRequest(subscriptionDetails).subscribe({
            next: () => {
                this.isLoading.set(false)
                this.alertService.success('Subscription request sent!')
                this.subscriptionFormService.form.reset()
                this.isError.set(false)
            },
            error: (error) => {
                this.isLoading.set(false)
                this.alertService.error(error.error.message)
                this.isError.set(true)
            },
        })
    }
}
