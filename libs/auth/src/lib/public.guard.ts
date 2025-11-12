import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthStateService } from './auth-state.service'

export function publicGuard(): CanActivateFn {
    return () => {
        const authService = inject(AuthStateService)
        const router = inject(Router)

        return authService.isLoggedIn()
            ? router.createUrlTree(['/dashboard/home'])
            : true
    }
}
