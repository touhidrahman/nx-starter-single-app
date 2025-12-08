import { Component, inject } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { MessageService } from 'primeng/api'
import { PermissionRequest, PermissionRequestDto } from '../permission-request.model'
import { PermissionRequestApiService } from '../permission-request-api.service'

@Component({
    selector: 'lib-permission-request-toast',
    imports: [PrimeModules],
    templateUrl: './permission-request-toast.component.html',
    styleUrl: './permission-request-toast.component.css',
})
export class PermissionRequestToastComponent {
    private alertService = inject(AlertService)
    private permissionRequestApiService = inject(PermissionRequestApiService)
    private messageService = inject(MessageService)
    private authStateService = inject(AuthStateService)

    private readonly toastKey = 'permissionToast'

    onConfirm(data: string) {
        this.submitPermissionData(data)
        this.messageService.clear(this.toastKey)
    }

    onReject() {
        this.messageService.clear(this.toastKey)
    }

    private submitPermissionData(data: string) {
        const permission: PermissionRequestDto = {
            claim: data,
            roleId: this.authStateService.getUserRoleId() ?? '',
            groupId: this.authStateService.getGroupId() ?? '',
            creatorId: this.authStateService.getUserId() ?? '',
        }

        this.permissionRequestApiService.create(permission).subscribe({
            next: (res: ApiResponse<PermissionRequest>) => {
                if (res.data) {
                    this.alertService.success(res.message as string)
                    this.messageService.clear(this.toastKey)
                }
            },

            error: (err) => {
                this.alertService.error(err.error.message)
            },
        })
    }
}
