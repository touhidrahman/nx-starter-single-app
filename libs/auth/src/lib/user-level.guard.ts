import { inject } from '@angular/core'
import { CanMatchFn, Router } from '@angular/router'
import { UserLevel } from '@repo/user'
import { AuthStateService } from './auth-state.service'

export function userLevelGuardFn(allowedLevels: UserLevel[]): CanMatchFn {
    return (_route, segments) => {
        const authStateService = inject(AuthStateService)
        const router = inject(Router)
        const userLevel = authStateService.getUserLevel()

        if (userLevel !== null && allowedLevels.includes(userLevel)) {
            return true
        }

        const currentUrl = segments.map((segment) => segment.path).join('/')
        return router.createUrlTree(['/access-denied'], {
            queryParams: { returnUrl: currentUrl },
        })
    }
}
