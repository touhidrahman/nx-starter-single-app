import {
    ChangeDetectorRef,
    Component,
    effect,
    inject,
    OnInit,
    signal,
} from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { NoDataComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { UniqueKeyValuePairCollection } from '@repo/common-util'
import { PrimeModules } from '@repo/prime-modules'
import { AuthStateService } from '@repo/auth'
import {
    AdminGroupManagementStateService,
    LoggedInGroupStateService,
} from '@repo/group'
import {
    ClaimStateService,
    Role,
    RoleCreateDialogComponent,
    RoleFormDialogData,
    RoleFormDialogResult,
} from '@repo/role-permission'
import { isSubset } from 'es-toolkit'
import { AccordionModule } from 'primeng/accordion'
import { MenuItem } from 'primeng/api'
import { DialogService } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-permissions-content',
    imports: [
        ...PrimeModules,
        NoDataComponent,
        FormsModule,
        ReactiveFormsModule,
        AccordionModule,
    ],
    templateUrl: './permissions-content.component.html',
    styleUrl: './permissions-content.component.scss',
    providers: [ClaimStateService],
})
export class PermissionsContentComponent implements OnInit {
    private alertMessage = inject(AlertService)
    private authStateService = inject(AuthStateService)
    private dialogService = inject(DialogService)
    private alertService = inject(AlertService)
    private loggedInGroupStateService = inject(LoggedInGroupStateService)
    private adminGroupManagementStateService = inject(
        AdminGroupManagementStateService,
    )
    private route = inject(ActivatedRoute)
    private cdr = inject(ChangeDetectorRef)
    protected claimStateService = inject(ClaimStateService)

    loading: 'loading' | 'loaded' | 'nodata' | 'error' = 'loading'
    selectedRole = signal<Role | null>(null)
    roles = signal<Role[]>([])
    roleClaimMap = new UniqueKeyValuePairCollection<string, string>() // RoleID, ClaimID
    selectedRoleId: string | null = null
    groupId = signal<string | null>('')

    // its for admin group management
    groupIdForAdminGroupManagement = signal<string | null>('')

    // after roles are loaded, fill the permissions map
    readonly _fillPermissionsMap = effect(() => {
        this.roles().forEach((role) => {
            role.claims.forEach((claim) => {
                this.claimStateService.hasClaim(claim) &&
                    this.roleClaimMap.add(role.id, claim)
            })
        })
    })

    getSectionHeader(section: string): string {
        return section || 'General'
    }

    ngOnInit(): void {
        const groupIdForAdminGroupManagement =
            this.route.parent?.snapshot.paramMap.get('groupId')
        this.groupIdForAdminGroupManagement.set(
            groupIdForAdminGroupManagement ?? '',
        )

        this.groupId.set(this.route.snapshot.paramMap.get('groupId') as string)
        this.route.parent?.paramMap.subscribe((params) => {
            this.groupId.set(params.get('groupId'))
        })
        if (this.groupId()) {
            this.claimStateService.groupId.set(this.groupId() as string)
        }

        this.getRoles()
    }

    isAllTicked(roleId: string): boolean {
        const roleClaims =
            this.roles().find((r) => r.id === roleId)?.claims ?? []
        return isSubset(this.claimStateService.claimIds(), roleClaims)
    }

    isAllTickedForSection(roleId: string, section: string): boolean {
        const sectionClaims = this.claimStateService
            .groupedClaims()
            [section].map((c) => c.id)
        const roleClaims =
            this.roles().find((r) => r.id === roleId)?.claims ?? []
        return isSubset(sectionClaims, roleClaims)
    }

    onCheckboxChange(claimId: string, roleId: string): void {
        this.roleClaimMap.toggle(roleId, claimId)
    }

    toggleTickingAllClaims(roleId: string, value: boolean): void {
        this.claimStateService.claimIds().forEach((claimId) => {
            if (value) {
                this.roleClaimMap.add(roleId, claimId)
            } else {
                this.roleClaimMap.deleteValues(roleId)
            }
        })
    }

    isChecked(claimId: string, roleId: string): boolean {
        return this.roleClaimMap.has(roleId, claimId)
    }

    isClaimChecked(claimId: string, roleId: string): boolean {
        return this.roles().some(
            (r) => r.id === roleId && r.claims.map((c) => c.includes(claimId)),
        )
    }

    saveRole(roleId: string): void {
        if (!roleId) {
            this.alertMessage.warn('Please select a role first.')
            return
        }

        const checkedClaims = []
        for (const [key, value] of this.roleClaimMap) {
            if (key === roleId) {
                checkedClaims.push(value)
            }
        }

        this.loggedInGroupStateService
            .updateRole(roleId, checkedClaims)
            .subscribe({
                next: () => {
                    this.alertMessage.success('Permissions saved successfully')
                },
                error: () => {
                    this.alertMessage.error('Failed to save permissions')
                },
            })
    }

    onRoleChange(roleId: string): void {
        this.selectedRole.set(this.roles().find((r) => r.id === roleId) || null)
    }

    confirmDelete(event: Event, data: Role) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Role',
            message: 'Are you sure you want to delete?',
            confirmAction: () => this.deleteRole(data.id),
        }
        this.alertService.confirm(confirmDialogData)
    }

    openCreateRoleDialogue(role: Role | null) {
        const header = role ? 'Edit role' : 'Create role'
        const data: RoleFormDialogData = {
            role,
            groupId: this.groupIdForAdminGroupManagement() ?? '',
        }

        const ref = this.dialogService.open(RoleCreateDialogComponent, {
            header,
            width: '70vw',
            modal: true,
            dismissableMask: false,
            closable: true,
            data,
        })

        ref?.onClose.subscribe({
            next: (res: RoleFormDialogResult) => {
                if (!res.role) return
                if (res.role) {
                    if (this.groupId()) {
                        this.adminGroupManagementStateService.pushRole(res.role)
                    } else {
                        this.loggedInGroupStateService.pushRole(res.role)
                    }

                    this.alertService.success(
                        `Role ${res.role.name} created successfully`,
                    )
                }
            },
            error: (err) => {
                this.alertService.error(`Error while creating role: ${err}`)
            },
        })
    }

    getRoleMenuItems(role: Role): MenuItem[] {
        return [
            {
                items: [
                    {
                        label: 'Delete Role',
                        icon: 'pi pi-trash',
                        command: () => {
                            const event = new MouseEvent('click')
                            this.confirmDelete(event, role)
                        },
                    },
                ],
            },
        ]
    }

    private getRoles() {
        const groupId = this.groupId()
        if (groupId) {
            this.getRolesInAdminView(groupId)
        } else {
            this.getRolesInUserView()
        }
    }

    private getRolesInAdminView(groupId: string) {
        this.adminGroupManagementStateService.init(groupId)
        this.adminGroupManagementStateService
            .select('roles')
            .subscribe((roles) => {
                this.roles.set(roles)
                this.loading = roles.length === 0 ? 'nodata' : 'loaded'
                this.cdr.detectChanges()
            })
    }

    private getRolesInUserView() {
        this.loggedInGroupStateService.select('roles').subscribe({
            next: (res) => {
                this.roles.set(res)
                this.loading = res.length === 0 ? 'nodata' : 'loaded'
                const currentUserRole = res.find(
                    (r) => r.id === this.authStateService.getUserRoleId(),
                )
                if (currentUserRole) {
                    this.selectedRole.set(currentUserRole)
                    this.selectedRoleId = currentUserRole.id
                }
                this.cdr.detectChanges()
            },
            error: () => {
                this.loading = 'error'
                this.alertMessage.error('Failed to fetch roles')
                this.cdr.detectChanges()
            },
        })
    }

    private deleteRole(roleId: string) {
        const groupId = this.groupId()
        const deleteService = groupId
            ? this.adminGroupManagementStateService
            : this.loggedInGroupStateService

        deleteService.deleteRole(roleId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.alertService.success('Role deleted successfully')
                } else {
                    this.alertService.error('Failed to delete role')
                }
            },
            error: () => {
                this.alertService.error(
                    'An error occurred while deleting the role',
                )
            },
        })
    }
}
