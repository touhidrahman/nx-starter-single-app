import { Component, inject, OnInit, signal } from '@angular/core'
import { AlertService, LocalStorageService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { SubscriptionStatus, SubscriptionsApiService, SubscriptionType } from '@repo/subscription'

//! TODO : move type file

export interface SubscribedPlan {
    planId: string
    subscriptionType: SubscriptionType
    groupId: string
    userId: string
}

@Component({
    selector: 'app-page-payment',
    imports: [PrimeModules],
    templateUrl: './page-payment.component.html',
    styleUrl: './page-payment.component.scss',
})
export class PagePaymentComponent implements OnInit {
    private localStorageService = inject(LocalStorageService)
    private subscriptionApiService = inject(SubscriptionsApiService)
    private alertService = inject(AlertService)

    subscribedPlan: SubscribedPlan | null = null
    isLoading = signal(false)
    isError = signal(false)

    ngOnInit(): void {
        this.getPlanDetails()
    }

    confirmSubscription(): void {
        this.isLoading.set(true)
        const subscription = {
            planId: this.subscribedPlan?.planId,
            subscriptionType: this.subscribedPlan?.subscriptionType,
            groupId: this.subscribedPlan?.groupId,
            userId: this.subscribedPlan?.userId,
            status: SubscriptionStatus.ACTIVE,
            // TODO: fix
            paymentMethod: 'bKash',
            transactionId: 'fg547ggff',
        }
        this.subscriptionApiService.create(subscription).subscribe({
            next: () => {
                this.localStorageService.removeItem('subscribedPlan')
                this.alertService.success('Subscription created successfully')
                this.isLoading.set(false)
                //! TODO: Redirect to success page
            },
            error: () => {
                this.alertService.error('Subscription failed')
                this.isLoading.set(false)
            },
        })
    }

    private getPlanDetails(): void {
        const subscribedPlan = this.localStorageService.getItem('subscribedPlan')
        if (subscribedPlan) {
            this.subscribedPlan = JSON.parse(subscribedPlan) as SubscribedPlan
        }
    }
}
