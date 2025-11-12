import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { LoggedInGroupStateService } from '@repo/group'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { map, of, switchMap } from 'rxjs'

@Component({
    selector: 'app-change-role-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, ...PrimeModules],
    templateUrl: './change-role-dialog.component.html',
    styleUrl: './change-role-dialog.component.css',
})
export class ChangeRoleDialogComponent {
    private ref = inject(DynamicDialogRef)
    private config = inject(DynamicDialogConfig)
    private stateService = inject(LoggedInGroupStateService)
    private alertService = inject(AlertService)

    selectedRole = ''

    roles$ = of(this.config.data?.groupId).pipe(
        switchMap((groupId) => {
            if (groupId) {
                return this.stateService['getRoles'](groupId)
            }
            return this.stateService.select('roles')
        }),
        map((roles) =>
            roles.map((role) => ({
                label: role.name,
                value: role.id,
                isDefaultRole: role.isSystemRole,
            })),
        ),
    )

    ngOnInit() {
        if (this.config.data?.roleId) {
            this.selectedRole = this.config.data.roleId
        }
        console.log('selectedRole on init', this.config.data)
    }

    saveRole() {
        const userId = this.config.data.id
        if (!userId || !this.selectedRole) return

        this.stateService.updateUserRole(userId, this.selectedRole).subscribe({
            next: () => {
                this.alertService.success('Role updated successfully')
                this.ref?.close(true)
            },
            error: () => {
                this.alertService.error('Failed to update role')
            },
        })
    }

    closeDialog() {
        this.ref?.close()
    }
}
