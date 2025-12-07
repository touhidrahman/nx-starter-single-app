import { CommonModule } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { MathVerificationComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { User } from '../../user.model'
import { UserListStateService } from '../../user-list-state.service'

@Component({
    selector: 'app-user-delete-confirm-modal',
    imports: [CommonModule, PrimeModules, MathVerificationComponent],
    templateUrl: './user-delete-confirm-modal.component.html',
    styleUrl: './user-delete-confirm-modal.component.css',
})
export class UserDeleteConfirmModalComponent {
    readonly config = inject(DynamicDialogConfig)
    private ref = inject(DynamicDialogRef)
    private alertService = inject(AlertService)
    private userListStateService = inject(UserListStateService)

    mathVerified = signal<boolean>(false)
    isValid = computed(() => this.mathVerified() && this.config.data.id)
    onMathVerified(isVerified: boolean) {
        this.mathVerified.set(isVerified)
    }

    confirmDelete(event: Event) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Group',
            message: 'Are you sure you want to delete?',
            confirmAction: () => this.deleteUser(this.config.data.id as string),
        }
        this.alertService.confirm(confirmDialogData)
    }

    deleteUser(id: string) {
        this.userListStateService.deleteUser(id).subscribe({
            next: (res: ApiResponse<User>) => {
                this.alertService.success('User deleted successfully')
                this.ref?.close(res.data)
            },
            error: (err) => {
                this.alertService.error(err.error.message || 'Failed to delete user')
            },
        })
    }
}
