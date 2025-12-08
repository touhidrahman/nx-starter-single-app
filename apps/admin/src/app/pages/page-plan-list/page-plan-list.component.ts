import { AsyncPipe, CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { Plan, PlanCreateDialogComponent, PlanFormDialogData, PlanStateService } from '@repo/plan'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-plan-list',
    imports: [CommonModule, ...PrimeModules, AsyncPipe, NoDataComponent],
    templateUrl: './page-plan-list.component.html',
    styleUrl: './page-plan-list.component.css',
    providers: [PlanStateService],
})
export class PagePlanListComponent implements OnInit {
    private alertService = inject(AlertService)
    private dialogService = inject(DialogService)
    planStateService = inject(PlanStateService)

    ngOnInit(): void {
        this.planStateService.init()
    }

    openPlanDialog(plan: Plan | null) {
        const isUpdate = plan
        const header = isUpdate ? 'Edit Plan' : 'Add plan'
        const data: PlanFormDialogData = {
            plan,
        }

        const ref = this.dialogService.open(PlanCreateDialogComponent, {
            header,
            width: '50vw',
            dismissableMask: false,
            closable: true,
            data,
        })

        ref?.onClose.subscribe({
            next: (data) => {
                if (data) {
                    if (isUpdate !== null) {
                        this.planStateService.replacePlan(data)
                    } else {
                        this.planStateService.pushPlan(data)
                    }
                }
            },
            error: (err) => {
                this.alertService.error(err.error.message)
            },
        })
    }

    deletePlan(planId: string) {
        this.planStateService.deletePlan(planId).subscribe({
            next: (_data) => this.alertService.success('Deleted'),
            error: (err) => this.alertService.error(err.message),
        })
    }

    confirmDelete(plan: Plan) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete plan',
            message: `Are you sure you want to delete ${plan.id}?`,
            confirmAction: () => this.deletePlan(plan.id),
        }
        this.alertService.confirm(confirmDialogData)
    }
}
