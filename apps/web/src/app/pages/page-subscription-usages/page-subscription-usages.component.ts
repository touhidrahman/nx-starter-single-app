import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { AllPlansComponent, Plan } from '@repo/plan'
import {
    CurrentSubscriptionCardComponent,
    Subscription,
    SubscriptionsApiService,
} from '@repo/subscription'

@Component({
    selector: 'app-page-subscription-usages',
    imports: [CommonModule, CurrentSubscriptionCardComponent, AllPlansComponent],
    templateUrl: './page-subscription-usages.component.html',
    styleUrl: './page-subscription-usages.component.css',
})
export class PageSubscriptionUsagesComponent implements OnInit {
    private alertService = inject(AlertService)
    private subscriptionApiService = inject(SubscriptionsApiService)
    private authStateService = inject(AuthStateService)

    subscription = signal<Subscription | null>(null)
    plan = signal<Plan | null>(null)
    isLoading = signal(false)
    isError = signal(false)

    ngOnInit(): void {
        this.getActiveSubscription(this.authStateService.getGroupId() ?? '')
    }

    private getActiveSubscription(groupId: string) {
        this.isLoading.set(true)
        this.subscriptionApiService.getSubscriptionByGroupId(groupId).subscribe({
            next: (res: ApiResponse<Subscription>) => {
                this.isLoading.set(false)
                this.subscription.set(res.data)
            },
            error: (err) => {
                this.isLoading.set(false)
                this.isError.set(true)
                this.alertService.error(err.error.message)
            },
        })
    }
}
