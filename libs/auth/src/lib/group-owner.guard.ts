import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router'
import { AlertService } from '@repo/common-services'
import { LoggedInGroupStateService } from '@repo/group'
import { map, Observable, of } from 'rxjs'
import { AuthStateService } from './auth-state.service'

export const groupOwnerGuard: CanActivateFn = (
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
): Observable<boolean> => {
    const authStateService = inject(AuthStateService)
    const alertService = inject(AlertService)
    const loggedInGroupStateService = inject(LoggedInGroupStateService)

    const { group, user } = authStateService.getState()

    if (!group?.id) {
        alertService.error('No group ID provided')
        return of(false)
    }

    return loggedInGroupStateService.select('groupOwner').pipe(
        map((owner) => {
            if (owner?.id === user?.id) {
                return true
            }
            return false
        }),
    )
}
