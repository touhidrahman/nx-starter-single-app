import { AsyncPipe, CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { AdminAuthStateService, AuthStateService } from '@repo/auth'
import {
    AdminGroupManagementStateService,
    ChangeRoleDialogComponent,
    GroupMemberRemoveDialogComponent,
    InviteMemberDialogComponent,
    LoggedInGroupStateService,
} from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { User, UserDeleteConfirmModalComponent, UserListStateService } from '@repo/user'
import { DialogService } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-group-members',
    imports: [CommonModule, FormsModule, ...PrimeModules, AsyncPipe],
    templateUrl: './group-members.component.html',
    styleUrl: './group-members.component.scss',
})
export class GroupMembersComponent implements OnInit {
    private dialogService = inject(DialogService)
    private authStateService = inject(AuthStateService)
    private adminAuthStateService = inject(AdminAuthStateService)
    private route = inject(ActivatedRoute)
    private userListStateService = inject(UserListStateService)
    protected loggedInGroupStateService = inject(LoggedInGroupStateService)
    protected adminGroupManagementStateService = inject(AdminGroupManagementStateService)

    groupId = signal<string | null>('')
    isAdmin = signal<boolean>(false)
    hasRoleChangePermission = this.authStateService.hasPermission('role:assign')

    ngOnInit(): void {
        this.getGroupIdFromRoute()

        const id = this.groupId()
        if (id) {
            this.loggedInGroupStateService.init()
            this.adminGroupManagementStateService.init(id)
        }

        if (this.adminAuthStateService.getUserLevel() === 'admin') {
            this.isAdmin.set(true)
        }
    }

    openInviteMemberDialog() {
        this.dialogService.open(InviteMemberDialogComponent, {
            header: 'Invite Member',
            width: '50vw',
            modal: true,
            dismissableMask: false,
            closable: true,
            breakpoints: {
                '1920px': '800px',
                '1200px': '600px',
                '960px': '75vw',
                '640px': '90vw',
            },
            data: { groupId: this.groupId() },
        })
    }

    assignRole(data: User) {
        this.dialogService.open(ChangeRoleDialogComponent, {
            header: 'Change Role',
            modal: true,
            width: '50vw',
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            style: { height: '70vh' },
            dismissableMask: true,
            closable: true,
            styleClass: 'custom-dialog',
            data: data,
        })
    }

    onOpenGroupMemberRemoveDialog(user: User) {
        this.dialogService.open(GroupMemberRemoveDialogComponent, {
            header: 'Remove Member',
            width: '50vw',
            breakpoints: {
                '960px': '75vw',
                '640px': '95vw',
            },
            modal: true,
            dismissableMask: false,
            closable: true,
            data: {
                user,
                groupId: this.groupId(),
            },
        })
    }

    openUserDeleteModal(user: User) {
        const deleteRef = this.dialogService.open(UserDeleteConfirmModalComponent, {
            header: 'Delete User Permanently',
            width: '50%',
            breakpoints: {
                '960px': '75vw',
                '640px': '95vw',
            },
            modal: true,
            closable: true,
            data: user,
        })

        deleteRef?.onClose.subscribe((res) => {
            if (res) {
                this.userListStateService.deleteUser(res.id).subscribe({
                    next: () => this.removeUserFromLocalState(res.id),
                })
            }
        })
    }

    private removeUserFromLocalState(userId: string) {
        this.loggedInGroupStateService.removeUserFromGroup(userId)

        const adminState = this.adminGroupManagementStateService.getState()
        const updatedAdminUsers = adminState.users.filter((u) => u.id !== userId)

        this.adminGroupManagementStateService.setState({
            ...adminState,
            users: updatedAdminUsers,
        })
    }

    onSubmitSearch(_form: NgForm) {}

    confirmDelete() {}

    private getGroupIdFromRoute() {
        this.groupId.set(this.route.snapshot.paramMap.get('groupId') as string)
        this.route.parent?.paramMap.subscribe((params) => {
            this.groupId.set(params.get('groupId'))
        })
    }
}
