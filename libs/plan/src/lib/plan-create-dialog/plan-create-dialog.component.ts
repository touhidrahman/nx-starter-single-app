import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { Plan, PlanFormDialogData } from '../plan.model'
import { PlanApiService } from '../plan-api.service'
import { PlanFormService } from '../plan-form.service'

@Component({
    selector: 'app-plan-create-dialog',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './plan-create-dialog.component.html',
    styleUrl: './plan-create-dialog.component.css',
    providers: [PlanFormService],
})
export class PlanCreateDialogComponent implements OnInit {
    private planApiService = inject(PlanApiService)
    private alertService = inject(AlertService)
    config = inject<DynamicDialogConfig<PlanFormDialogData>>(DynamicDialogConfig)
    private ref = inject(DynamicDialogRef)

    planFromService = inject(PlanFormService)
    isLoading = signal(false)
    isEdit = signal(false)

    ngOnInit(): void {
        this.getPlanData()
    }

    getPlanData() {
        const planData = this.config?.data?.plan
        if (planData) {
            this.isEdit.set(true)
            this.planFromService.patchForm(planData)
        }
    }

    onSubmit(event: Event) {
        this.isLoading.set(true)
        event?.preventDefault()
        const formValue = this.planFromService.getValue()

        const normalizeFeatures = (value: string | string[] | null): string[] | null => {
            if (!value) return null
            if (Array.isArray(value)) {
                const cleaned = value.map((f) => f.trim()).filter((f) => f)
                return cleaned.length > 0 ? cleaned : null
            }
            if (typeof value === 'string') {
                const cleaned = value
                    .split(',')
                    .map((f) => f.trim())
                    .filter((f) => f)
                return cleaned.length > 0 ? cleaned : null
            }
            return null
        }

        const plan: Plan = {
            ...formValue,
            activeFeatures: normalizeFeatures(formValue.activeFeatures),
            inactiveFeatures: normalizeFeatures(formValue.inactiveFeatures),
            discountPeriodStart: formValue.discountPeriodStart
                ? new Date(formValue.discountPeriodStart)
                : null,
            discountPeriodEnd: formValue.discountPeriodEnd
                ? new Date(formValue.discountPeriodEnd)
                : null,
        }

        if (this.isEdit() && this.config.data?.plan) {
            this.update(this.config.data.plan.id, plan)
        } else {
            this.create(plan)
        }
    }

    private create(plan: Plan) {
        this.planApiService.create(plan).subscribe({
            next: (res: ApiResponse<Plan>) => {
                this.ref?.close(res.data)
                this.planFromService.form.reset()
                this.isLoading.set(false)
                this.alertService.success('Plan added successfully')
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('Plan add failed')
            },
        })
    }

    private update(id: string, plan: Plan) {
        this.planApiService.update(id, plan).subscribe({
            next: (res: ApiResponse<Plan>) => {
                if (res.data) {
                    this.ref?.close(res.data)
                    this.isLoading.set(false)
                    this.alertService.success('Plan updated successfully')
                }
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('Plan update failed')
            },
        })
    }
}
