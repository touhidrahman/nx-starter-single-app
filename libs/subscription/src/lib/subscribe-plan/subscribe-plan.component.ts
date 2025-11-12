import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ApiResponse } from '@repo/common-models'
import { Plan, PlanApiService, PlanCardComponent } from '@repo/plan'
import { SubscriptionFormUserComponent } from '../subscription-form-user/subscription-form-user.component'

@Component({
    selector: 'app-subscribe-plan',
    imports: [CommonModule, PlanCardComponent, SubscriptionFormUserComponent],
    templateUrl: './subscribe-plan.component.html',
    styleUrl: './subscribe-plan.component.css',
})
export class SubscribePlanComponent implements OnInit {
    private activateRoute = inject(ActivatedRoute)
    private planApiService = inject(PlanApiService)

    planDetails = signal<Plan[]>([])
    plan = signal<Plan | null>(null)
    isYearly = signal<'monthly' | 'yearly'>('monthly')

    ngOnInit(): void {
        const planId = this.activateRoute.snapshot?.paramMap?.get('id')
        const query = this.activateRoute.snapshot.queryParamMap.get('isYearly')
        this.isYearly.set(query as 'monthly' | 'yearly')
        this.getPlanDetails(planId ?? '')
    }

    private getPlanDetails(id: string) {
        this.planApiService.findById(id).subscribe({
            next: (res: ApiResponse<Plan>) => {
                this.plan.set(res.data)
                this.planDetails.set([res.data])
            },
            error: () => {
                this.plan.set(null)
                this.planDetails.set([])
            },
        })
    }

    onYearlyChange(value: 'monthly' | 'yearly') {
        this.isYearly.set(value)
    }
}
