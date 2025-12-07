import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router'
import { AlertService } from '@repo/common-services'
import { MessageService } from 'primeng/api'
import { AuthStateService } from './auth-state.service'

export type PermissionGuardOptions = {
    showError?: boolean
}

export const permissionGuard = (
    requiredPermissions: string[],
    config: PermissionGuardOptions = { showError: true },
): CanActivateFn => {
    return (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
        const authStateService = inject(AuthStateService)
        const alert = inject(AlertService)
        const messageService = inject(MessageService)

        if (authStateService.isGroupOwner()) {
            return true // Group owners have all permissions
        }

        const showAccessRequestToast = (permission: string) => {
            messageService.add({
                key: 'permissionToast',
                severity: 'success',
                summary: "You don't have permission to access this page!",
                closable: true,
                sticky: false,
                data: permission,
            })
        }

        if (requiredPermissions.length === 0) {
            if (config?.showError) {
                alert.error('No permissions defined for this route.')
            }
            return false
        }

        const userPermissions = authStateService.getPermissions()

        if (!userPermissions || userPermissions.length === 0) {
            if (config?.showError) {
                alert.error('No permissions available for this user.')
                showAccessRequestToast(requiredPermissions[0])
            }
            return false
        }

        const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm))

        if (!hasPermission) {
            if (config?.showError) {
                alert.error('You do not have permission to access this page.')
                showAccessRequestToast(requiredPermissions[0])
            }
            return false
        }

        return true
    }
}
