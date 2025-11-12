import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { AuthStateService } from '@repo/auth'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { Role, RoleFormDialogResult } from '../role.model'
import { RoleApiService } from '../role-api.service'
import { RoleFormService } from '../role-form.service'

@Component({
    selector: 'lib-role-create-dialog',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './role-create-dialog.component.html',
    styleUrl: './role-create-dialog.component.scss',
    providers: [RoleFormService],
})
export class RoleCreateDialogComponent implements OnInit {
    private roleApiService = inject(RoleApiService)
    private alertService = inject(AlertService)
    private authStateService = inject(AuthStateService)
    private ref = inject(DynamicDialogRef)
    protected roleFormService = inject(RoleFormService)
    private config = inject(DynamicDialogConfig)

    isLoading = signal(false)
    groupId = signal<string>('')

    ngOnInit(): void {
        if (this.config.data.groupId) {
            this.groupId.set(this.config.data.groupId)
        } else {
            this.groupId.set(this.authStateService.getGroupId() ?? '')
        }
    }

    onSubmit(event: Event) {
        this.isLoading.set(true)
        event?.preventDefault()
        const formValue = this.roleFormService.getValue()
        const role: Role = {
            ...formValue,
            groupId: this.groupId(),
        }
        this.create(role)
    }

    private create(role: Role) {
        this.roleApiService.create(role).subscribe({
            next: (res) => {
                if (res.data) {
                    this.roleFormService.form.reset()
                    this.isLoading.set(false)
                    const result: RoleFormDialogResult = {
                        role: res.data,
                    }
                    this.ref?.close(result)
                }
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('Role add failed')
            },
        })
    }
}
