import { inject } from '@angular/core'
import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
} from '@angular/router'
import { AuthStateService } from './auth-state.service'

export function groupTypeGuard({
    redirectTo,
}: {
    redirectTo: string[]
}): CanActivateFn {
    return (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(AuthStateService).getGroupType() === 'vendor'
            ? true
            : inject(Router).createUrlTree(redirectTo, {
                  queryParams: { returnUrl: state.url },
              })
    }
}
