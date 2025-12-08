import { ApplicationRef, Injectable, inject, isDevMode } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { concat, interval } from 'rxjs'
import { first } from 'rxjs/operators'

@Injectable({
    providedIn: 'root',
})
export class CheckUpdateService {
    private updateService = inject(SwUpdate)
    private appRef = inject(ApplicationRef)

    checkForUpdates() {
        // Prevent update check in dev mode or when service worker is not enabled
        if (!this.updateService.isEnabled || isDevMode()) {
            console.warn('Service worker updates are disabled or running in dev mode.')
            return
        }

        const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable === true))
        const everyTenMins$ = interval(10 * 60 * 1000)
        const updateTrigger$ = concat(appIsStable$, everyTenMins$)

        updateTrigger$.subscribe(async () => {
            try {
                const updateFound = await this.updateService.checkForUpdate()
                if (updateFound) {
                    window.alert('A new version of the app is available.')
                }
            } catch (err) {
                console.error('Failed to check for updates:', err)
            }
        })
    }
}
