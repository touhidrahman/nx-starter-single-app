import { Component, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { MathVerificationComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { GroupStateService } from '../../group-state.service'

@Component({
    selector: 'app-group-delete-confirm-modal',
    imports: [MathVerificationComponent, ...PrimeModules],
    templateUrl: './group-delete-confirm-modal.component.html',
    styleUrl: './group-delete-confirm-modal.component.css',
    providers: [GroupStateService],
})
export class GroupDeleteConfirmModalComponent {
    readonly config = inject(DynamicDialogConfig)
    private ref = inject(DynamicDialogRef)
    private alertService = inject(AlertService)
    private groupStateService = inject(GroupStateService)
    private router = inject(Router)

    mathVerified = signal<boolean>(false)
    isValid = computed(() => this.mathVerified() && this.config.data.id)
    onMathVerified(isVerified: boolean) {
        this.mathVerified.set(isVerified)
    }

    confirmDelete(event: Event) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Group',
            message: `Are you sure you want to delete ${this.config.data.id}?`,
            confirmAction: () =>
                this.onDeleteGroup(this.config.data.id as string),
        }

        this.alertService.confirm(confirmDialogData)
    }

    onDeleteGroup(id: string) {
        this.groupStateService.deleteGroup(id).subscribe({
            next: (res) => {
                this.alertService.success('Group deleted successfully.')
                this.ref?.close(res.data)
                this.router.navigate(['/groups'])
            },
            error: (err) => {
                this.alertService.error(err.message)
            },
        })
    }
}
