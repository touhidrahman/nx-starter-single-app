import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PlanCardComponent, PlanStateService } from '@repo/plan'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-price-plan',
    imports: [PlanCardComponent, PrimeModules, FormsModule, CommonModule],
    templateUrl: './price-plan.component.html',
    styleUrl: './price-plan.component.scss',
    providers: [PlanStateService],
})
export class PricePlanComponent implements OnInit {
    readonly planStateService = inject(PlanStateService)
    stateOptions: { label: string; value: string }[] = [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
    ]

    isYearly = signal<'monthly' | 'yearly'>('monthly')

    ngOnInit(): void {
        this.planStateService.init()
    }

    onYearlyChange(_value: 'monthly' | 'yearly'): void {
        this.isYearly.set(_value)
    }
}
