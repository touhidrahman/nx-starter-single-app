import { inject } from '@angular/core'
import { AuthStateService } from '@repo/auth'

export const appInitializerFn = () => {
    const authStateService = inject(AuthStateService)

    authStateService.initAuthFromStorage()

    return Promise.resolve()
}
