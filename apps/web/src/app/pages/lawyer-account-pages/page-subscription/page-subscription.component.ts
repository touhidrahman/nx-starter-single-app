import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { LocalStorageService } from '@repo/common-services'
import { PlanStateService } from '@repo/plan'
import { SubscriptionType } from '@repo/subscription'

@Component({
    selector: 'app-page-subscription',
    imports: [CommonModule],
    templateUrl: './page-subscription.component.html',
    styleUrl: './page-subscription.component.scss',
    providers: [PlanStateService],
})
export class PageSubscriptionComponent implements OnInit {
    private authStateService = inject(AuthStateService)
    private router = inject(Router)
    private localStorageService = inject(LocalStorageService)
    planStateService = inject(PlanStateService)
    planPriceType: SubscriptionType = SubscriptionType.MONTHLY
    subscriptionType = SubscriptionType

    userId = signal<string>('')
    groupId = signal<string>('')

    ngOnInit(): void {
        this.planStateService.init()
        this.getUserGroupId()
    }

    getFeatures(features: string | undefined): string[] {
        if (features) {
            return features
                .split(',')
                .map((feature) => feature.replace(/['"]/g, '').trim())
        }
        return []
    }

    togglePlan(planType: SubscriptionType) {
        this.planPriceType = planType
    }

    getPrice(monthlyPrice: number, yearlyPrice: number): number {
        return this.planPriceType === SubscriptionType.MONTHLY
            ? monthlyPrice
            : yearlyPrice
    }

    onSubscribe(planId: string) {
        if (!this.userId()) {
            this.router.navigate(['/login'])
            return
        }

        if (!this.groupId()) {
            this.router.navigate(['/create-profile'])
            return
        }

        const subscribedPlan = {
            planId: planId,
            subscriptionType: this.planPriceType,
            groupId: this.groupId(),
            userId: this.userId(),
        }
        this.localStorageService.setItem(
            'subscribedPlan',
            JSON.stringify(subscribedPlan),
        )
        this.router.navigate(['/payment'])
    }

    private getUserGroupId() {
        this.userId.set(this.authStateService.getUserId() ?? '')
        this.groupId.set(this.authStateService.getGroupId() ?? '')
    }
}
