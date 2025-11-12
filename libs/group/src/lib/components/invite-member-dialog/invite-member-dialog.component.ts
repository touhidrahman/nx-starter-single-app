import { Component, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ApiResponse, LabelValuePair } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { AuthStateService } from '@repo/auth'
import { User } from '@repo/user'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { AdminGroupManagementStateService } from '../../admin-group-state.service'
import { Invitation } from '../../invitation.model'
import { InvitationApiService } from '../../invitation-api.service'
import { InvitationFormService } from '../../invitation-form.service'
import { LoggedInGroupStateService } from '../../logged-in-group-state.service'

@Component({
    selector: 'app-invite-member-dialog',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './invite-member-dialog.component.html',
    styleUrl: './invite-member-dialog.component.scss',
    providers: [InvitationFormService],
})
export class InviteMemberDialogComponent {
    private alertService = inject(AlertService)
    private authStateService = inject(AuthStateService)
    private invitationApiService = inject(InvitationApiService)
    private loggedInGroupStateService = inject(LoggedInGroupStateService)
    readonly invitationFormService = inject(InvitationFormService)
    private ref = inject(DynamicDialogRef)
    private adminGroupManagementStateService = inject(
        AdminGroupManagementStateService,
    )
    private config = inject(DynamicDialogConfig)

    roleList: LabelValuePair<string>[] = []
    groupId = signal<string>('')
    invitedByUserEmail = signal<string>('')
    groupUsers = signal<User[] | []>([])
    isLoading = signal<boolean>(false)

    ngOnInit() {
        if (this.authStateService.getUserLevel() === 'user') {
            this.loadRoles()
        } else {
            this.loadGroupRolesFromAdmin()
        }
    }

    onSubmit(event: Event) {
        const groupId =
            this.authStateService.getGroupId() || this.config.data.groupId
        event?.preventDefault()
        this.isLoading.set(true)
        const formValue = this.invitationFormService.getValue()
        const invitationData = {
            ...formValue,
            groupId: groupId,
            invitedBy: this.authStateService.getUserEmail(),
        }

        this.invitationApiService.create(invitationData).subscribe({
            next: (response: ApiResponse<Invitation>) => {
                //! TODO : Have to integrate the functionality to send a email
                if (response) {
                    this.invitationFormService.form.reset()
                    this.isLoading.set(false)
                    this.alertService.success(response.message as string)
                    this.ref?.close()
                }
            },
            error: (err) => {
                this.isLoading.set(false)
                this.alertService.error(err.error.message)
            },
        })
    }

    onCancel() {
        this.ref?.close()
    }

    private loadRoles() {
        this.loggedInGroupStateService.select('roles').subscribe({
            next: (res) => {
                if (res) {
                    this.roleList = res.map((role) => ({
                        label: role.name,
                        value: role.id,
                        isDefaultRole: role.isSystemRole,
                    }))
                } else {
                    this.roleList = []
                }
            },
        })
    }

    private loadGroupRolesFromAdmin() {
        this.adminGroupManagementStateService.select('roles').subscribe({
            next: (res) => {
                if (res) {
                    this.roleList = res.map((role) => ({
                        label: role.name,
                        value: role.id,
                        isDefaultRole: role.isSystemRole,
                    }))
                } else {
                    this.roleList = []
                }
            },
        })
    }
}
