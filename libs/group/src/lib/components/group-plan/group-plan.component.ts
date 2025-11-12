import { Component, inject, input, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Group } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { GroupApiService } from '@repo/group'
import { Plan, PlanApiService, PlanStateService } from '@repo/plan'

@Component({
    selector: 'app-group-plan',
    imports: [PrimeModules, FormsModule],
    templateUrl: './group-plan.component.html',
    styleUrl: './group-plan.component.scss',
    providers: [PlanApiService, AlertService, PlanStateService],
})
export class GroupPlanComponent implements OnInit {
    planApiService = inject(PlanApiService)
    groupApiService = inject(GroupApiService)
    planStateService = inject(PlanStateService)
    alertService = inject(AlertService)
    group = input.required<Group | null>()
    plan = signal<Plan | null>(null)
    showForm = signal<boolean>(false)
    selectedPlanId = signal<string>('')

    ngOnInit() {}
}
