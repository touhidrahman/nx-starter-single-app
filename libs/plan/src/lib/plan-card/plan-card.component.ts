import { CommonModule, CurrencyPipe } from '@angular/common'
import {
    Component,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    signal,
} from '@angular/core'
import { Router } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { Plan } from '../plan.model'
import { PlanApiService } from '../plan-api.service'
import { PlanPerksWidgetComponent } from '../plan-perks-widget/plan-perks-widget.component'

@Component({
    selector: 'app-plan-card',
    imports: [CommonModule, PrimeModules, CurrencyPipe],
    templateUrl: './plan-card.component.html',
    styleUrl: './plan-card.component.css',
    providers: [DialogService],
})
export class PlanCardComponent implements OnDestroy {
    private router = inject(Router)
    private planApiService = inject(PlanApiService)
    private dialogService = inject(DialogService)

    allPlans = input<Plan[]>([])
    currentPlan = signal<Plan | null>(null)
    isYearly = input<'monthly' | 'yearly'>('monthly')
    yearlyChange = output<'monthly' | 'yearly'>()
    currentPlanId = input<string | undefined>(undefined)
    ref: DynamicDialogRef | null = null
    yearlyChanges() {
        this.yearlyChange.emit(this.isYearly())
    }

    constructor() {
        effect(() => {
            const id = this.currentPlanId()
            if (!id) return
            this.currentPlan.set(null)
            this.getPlanById()
        })
    }

    changePlan(newPlan: Plan) {
        const current = this.currentPlan()
        if (!current) {
            console.warn('Current plan not loaded yet')
            return
        }

        if (this.checkPlanChange(current, newPlan) === 'downgrade') {
            this.ref = this.dialogService.open(PlanPerksWidgetComponent, {
                header: 'Subscription overview',
                width: '50vw',
                modal: true,
                closable: true,
                contentStyle: { overflow: 'auto' },
                breakpoints: {
                    '960px': '75vw',
                    '640px': '90vw',
                },
                data: { currentPlan: this.currentPlan(), newPlan: newPlan },
            })
        } else {
            this.router.navigate(
                ['/dashboard/organization/subscribe-plan', newPlan.id],
                {
                    //TODO: change method for data sending "yearly/monthly"
                    queryParams: { isYearly: this.isYearly() },
                },
            )
        }
    }

    getPlanById() {
        this.currentPlanId &&
            this.planApiService.findById(this.currentPlanId() ?? '').subscribe({
                next: ({ data }) => {
                    if (data) {
                        this.currentPlan.set(data)
                    }
                },
            })
    }

    checkPlanChange(currentPlan: Plan, newPlan: Plan) {
        if (currentPlan.id === newPlan.id) {
            return
        }

        const metrics: (keyof Plan)[] = [
            'storageLimit',
            'maxUsers',
            'maxCases',
            'monthlySmsLimit',
            'monthlyAiCredits',
        ]

        let higherCount = 0
        let lowerCount = 0

        for (const key of metrics) {
            const currentValue = currentPlan[key] ?? 0
            const newValue = newPlan[key] ?? 0

            if (newValue > currentValue) higherCount++
            else if (newValue < currentValue) lowerCount++
        }

        if (higherCount > lowerCount) return 'upgrade'
        if (higherCount < lowerCount) return 'downgrade'
        return
    }

    ngOnDestroy() {
        if (this.ref) {
            this.ref.close()
        }
    }
}
