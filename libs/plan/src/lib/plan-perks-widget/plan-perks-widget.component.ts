import { Component, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { GroupOverview } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { GroupApiService } from '@repo/group'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-plan-perks-widget',
    imports: [PrimeModules],
    templateUrl: './plan-perks-widget.component.html',
    styleUrl: './plan-perks-widget.component.css',
})
export class PlanPerksWidgetComponent {
    config = inject(DynamicDialogConfig)
    private router = inject(Router)
    private alertService = inject(AlertService)
    private groupApiService = inject(GroupApiService)
    ref: DynamicDialogRef<PlanPerksWidgetComponent> | null = null
    groupOverview = signal<GroupOverview | null>(null)

    constructor() {
        this.groupApiService.getGroupOverview().subscribe({
            next: ({ data }) => {
                this.groupOverview.set(data)
            },
            error: (err) => {
                this.alertService.error(err.message)
            },
        })
    }

    onSubmit() {
        if (this.checkPackage()) {
            this.router.navigateByUrl('/dashboard/cases')
        } else {
            this.router.navigate([
                '/dashboard/organization/subscribe-plan',
                this.config?.data.newPlan.id,
            ])
        }
        this.ref?.close()
    }

    checkPackage() {
        const currentPlan = this.config?.data.currentPlan

        const {
            totalCases = 0,
            totalClients = 0,
            totalEnrollments = 0,
            storageUsed = 0,
        } = this.groupOverview() ?? {}

        const isLimitReached =
            totalCases >= currentPlan.maxCases ||
            totalClients >= currentPlan.maxUsers ||
            totalEnrollments >= currentPlan.maxCauseEnrollment ||
            storageUsed >= currentPlan.storageLimit

        console.log(isLimitReached)
        return isLimitReached
    }
}
