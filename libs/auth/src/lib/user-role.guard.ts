import { inject } from '@angular/core'
import { CanMatchFn, Router } from '@angular/router'
import { AuthStateService } from './auth-state.service'

/**
 * Guard to check if the user has the required role
 * TODO: Implement this guard
 * @returns
 */
export const userRoleGuard: CanMatchFn = () => {
    const authStateService = inject(AuthStateService)
    const router = inject(Router)

    const groupId = authStateService.getGroupId()

    return router.createUrlTree(['/access-denied'])
}
