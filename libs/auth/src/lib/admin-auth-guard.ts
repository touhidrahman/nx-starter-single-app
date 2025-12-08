import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router'
import { AdminAuthStateService } from './admin-auth-state.service'

export function adminAuthGuard({ redirectTo }: { redirectTo: string[] }): CanActivateFn {
    return (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(AdminAuthStateService).isLoggedIn()
            ? true
            : inject(Router).createUrlTree(redirectTo, {
                  queryParams: { returnUrl: state.url },
              })
    }
}
