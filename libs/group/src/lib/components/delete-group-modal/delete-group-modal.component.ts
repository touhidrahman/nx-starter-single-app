import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MathVerificationComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { GroupApiService, GroupStateService } from '@repo/group'
import { DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-delete-group-modal',
    imports: [PrimeModules, FormsModule, MathVerificationComponent],
    templateUrl: './delete-group-modal.component.html',
    styleUrl: './delete-group-modal.component.scss',
})
export class DeleteGroupModalComponent {
    private groupsApiService = inject(GroupApiService)
    private groupStateService = inject(GroupStateService)
    private alertService = inject(AlertService)
    private ref = inject(DynamicDialogRef)

    input = signal<number>(0)
    groupId = signal<string>('')
    mathVerified = signal<boolean>(false)
    isValid = computed(() => this.mathVerified() && this.groupId())

    onInputValue(event: Event) {
        const val = (event.target as HTMLInputElement).value
        this.input.set(Number(val))
    }

    onGroupId(event: Event) {
        const val = (event.target as HTMLInputElement).value
        this.groupId.set(val)
    }

    onMathVerified(isVerified: boolean) {
        this.mathVerified.set(isVerified)
    }

    deleteGroup(id: string) {
        this.groupStateService.deleteGroup(id).subscribe({
            next: () => {
                this.ref?.close()
                this.alertService.success(
                    'Group deleted successfully including everything!',
                )
            },
            error: (err) => {
                this.alertService.error(err.message)
            },
        })
    }

    confirmDelete(event: Event) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Group',
            message: 'Are you sure you want to delete?',
            confirmAction: () => this.deleteGroup(this.groupId() as string),
        }
        this.alertService.confirm(confirmDialogData)
    }
}
