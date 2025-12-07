import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { PermissionRequestsListStateService } from '../permission-request-state.service'

@Component({
    selector: 'lib-permission-request-modal',
    imports: [CommonModule, PrimeModules, NoDataComponent],
    templateUrl: './permission-request-modal.component.html',
    styleUrl: './permission-request-modal.component.css',
})
export class PermissionRequestModalComponent {
    private alertService = inject(AlertService)
    permissionRequestsListStateService = inject(PermissionRequestsListStateService)

    config = inject<DynamicDialogConfig<unknown>>(DynamicDialogConfig)

    onReadPermissionRequest(id: string) {
        this.permissionRequestsListStateService.readPermissionRequest(id).subscribe({
            next: () => {
                this.alertService.success('Permission request read')
            },
            error: () => {
                this.alertService.error('Failed to read permission request')
            },
        })
    }

    onApprovePermissionRequest(id: string) {
        this.permissionRequestsListStateService.approvePermissionRequest(id).subscribe({
            next: () => {
                this.alertService.success('Permission request approved')
            },
            error: () => {
                this.alertService.error('Failed to approve permission request')
            },
        })
    }
}
