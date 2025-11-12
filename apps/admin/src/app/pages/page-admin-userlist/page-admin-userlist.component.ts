import { CommonModule, NgClass } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NoDataComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import {
    AdminAddDialogComponent,
    AdminUser,
    AdminUserDto,
    UserAdminApiService,
    UserLevel,
    UserStatus,
} from '@repo/user'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-admin-userlist',
    templateUrl: './page-admin-userlist.component.html',
    styleUrl: './page-admin-userlist.component.scss',
    imports: [
        NgClass,
        FormsModule,
        CommonModule,
        PrimeModules,
        NoDataComponent,
    ],
})
export class PageAdminUserlistComponent implements OnInit {
    private userAdminApiService = inject(UserAdminApiService)
    private alertService = inject(AlertService)
    dialogService = inject(DialogService)

    users: AdminUser[] = []
    isLoading = signal<boolean>(true)
    isError = signal<boolean>(false)

    displayEditAdminDialog = false
    selectedAdmin: Partial<AdminUserDto> = {}

    statusOptions: {
        label: string
        value: UserStatus
    }[] = [
        { label: 'Active', value: UserStatus.ACTIVE },
        { label: 'Inactive', value: UserStatus.INACTIVE },
    ]

    selectedStatus: UserStatus = UserStatus.ACTIVE
    ngOnInit() {
        this.getUsers()
    }

    getUsers() {
        this.isLoading.set(true)
        this.userAdminApiService.getAllAdmins({}).subscribe({
            next: (response: ApiResponse<any>) => {
                this.users = response?.data as AdminUser[]
                this.isLoading.set(false)
            },
            error: (error: any) => {
                console.error('Error fetching users:', error)
                this.isLoading.set(false)
            },
            complete: () => {
                this.isLoading.set(false)
            },
        })
    }

    openAdminCreateModal() {
        const ref = this.dialogService.open(AdminAddDialogComponent, {
            width: '40vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe((newAdmin: AdminUser) => {
            if (newAdmin) {
                this.alertService.success('Admin created successfully')
                this.users = [...this.users, newAdmin]
            }
        })
    }

    openEditAdminDialog(admin: AdminUser) {
        this.selectedAdmin = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            level: UserLevel.Admin,
            status: admin.status,
            verified: admin.verified,
        }
        this.displayEditAdminDialog = true
    }
    updateAdminStatus() {
        if (!this.selectedAdmin.id) return
        this.isLoading.set(true)
        this.userAdminApiService
            .updateAdmin(this.selectedAdmin.id, this.selectedAdmin)
            .subscribe({
                next: (_response) => {
                    this.alertService.success(
                        'Admin status updated successfully',
                    )
                    this.displayEditAdminDialog = false
                    this.getUsers()
                    this.isLoading.set(false)
                },
                error: (err) => {
                    this.alertService.error('Failed to update admin status')
                    console.error('Error updating admin status:', err)
                    this.isLoading.set(false)
                },
            })
    }
}
