import { CommonModule } from '@angular/common'
import { Component, inject, input, OnInit, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'
import { Plan } from '../plan.model'
import { PlanCardComponent } from '../plan-card/plan-card.component'
import { PlanStateService } from '../plan-state.service'

@Component({
    selector: 'app-all-plans',
    imports: [CommonModule, PrimeModules, FormsModule, PlanCardComponent],
    templateUrl: './all-plans.component.html',
    styleUrl: './all-plans.component.css',
    providers: [PlanStateService],
})
export class AllPlansComponent implements OnInit {
    readonly planStateService = inject(PlanStateService)
    stateOptions: { label: string; value: string }[] = [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
    ]

    isYearly = signal<'monthly' | 'yearly'>('monthly')
    currentPlanId = input<string | undefined>(undefined)

    ngOnInit(): void {
        this.planStateService.init()
    }

    onYearlyChange(_value: 'monthly' | 'yearly'): void {
        this.isYearly.set(_value)
    }
}
