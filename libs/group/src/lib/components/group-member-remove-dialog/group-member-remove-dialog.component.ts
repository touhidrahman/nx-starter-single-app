import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { MathVerificationComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { GroupApiService } from '../../group-api.service'
import { LoggedInGroupStateService } from '../../logged-in-group-state.service'

@Component({
    selector: 'app-group-member-remove-dialog',
    imports: [CommonModule, PrimeModules, MathVerificationComponent],
    templateUrl: './group-member-remove-dialog.component.html',
    styleUrl: './group-member-remove-dialog.component.css',
})
export class GroupMemberRemoveDialogComponent {
    private ref = inject(DynamicDialogRef)
    private authStateService = inject(AuthStateService)
    private groupApiService = inject(GroupApiService)
    private alertService = inject(AlertService)
    private loggedInGroupStateService = inject(LoggedInGroupStateService)
    protected config = inject(DynamicDialogConfig)

    isMathVerified = signal<boolean>(false)
    isError = signal<boolean>(false)
    isLoading = signal<boolean>(false)

    onRemoveMember() {
        this.isLoading.set(true)
        this.groupApiService
            .removeUserFromOrganization(
                this.authStateService.getGroupId() ?? this.config?.data?.groupId,
                this.config?.data?.user.id,
            )
            .subscribe({
                next: (res: ApiResponse<unknown>) => {
                    this.isLoading.set(false)
                    this.loggedInGroupStateService.removeUserFromGroup(res.data as string)
                    this.alertService.success('Member removed successfully.')
                    this.ref?.close()
                },
                error: (err) => {
                    this.isLoading.set(false)
                    this.isError.set(true)
                    this.alertService.error(err.error.message)
                },
            })
    }

    onVerified(isVerified: boolean) {
        this.isMathVerified.set(isVerified)
    }

    onCloseModal() {
        this.ref?.close()
    }
}
