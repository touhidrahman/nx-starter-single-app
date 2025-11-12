import { Injectable, inject, signal } from '@angular/core'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { AuthStateService } from '@repo/auth'
import { UserSettingStateService } from '@repo/user-setting'
import { combineLatest, Subscription } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class DisplayIdleService {
    private userSettingStateService = inject(UserSettingStateService)
    private authStateService = inject(AuthStateService)

    private lockTimer: ReturnType<typeof setTimeout> | null = null
    private idleTime = (5 * 10 * 1000) as number
    private registeredEvents: string[] = []
    private subscription: Subscription | null = null

    isLocked = signal<boolean>(false)

    constructor() {
        this.subscription = combineLatest([
            this.userSettingStateService.selectAll(),
            this.authStateService.selectAll(),
        ]).subscribe(([userSettings, authState]) => {
            const isLoggedIn = authState.isLoggedIn
            const isPinSet = userSettings.isPinCodeSet
            const isPinEnabled = userSettings.settings.isPinEnabled === 'true'

            if (
                Capacitor.isNativePlatform() &&
                isPinEnabled &&
                isLoggedIn &&
                isPinSet
            ) {
                this.checkDeviceDisplayState()
                this.checkDisplayIdle()
            } else {
                this.clearLockTimer()
                this.removeEventListeners()
            }
        })
    }

    /** App state change (background/foreground) */
    private checkDeviceDisplayState() {
        App.addListener('appStateChange', ({ isActive }) => {
            const isLoggedIn = this.authStateService.isLoggedIn()
            const userSettings = this.userSettingStateService.getState()
            const isPinSet = userSettings.isPinCodeSet
            const isPinEnabled = userSettings.settings.isPinEnabled === 'true'
            if (!isActive && isLoggedIn && isPinSet && isPinEnabled) {
                this.lock()
            } else {
                this.clearLockTimer()
            }
        })
    }

    /** Idle check by user interaction */
    private checkDisplayIdle(): void {
        this.removeEventListeners() // পুরনো লিসেনার সরাও

        const mouseEvents = ['click', 'mousemove', 'mousedown', 'mouseup']
        const keyboardEvents = ['keydown']
        const touchEvents = ['touchstart']

        const allEvents = [...mouseEvents, ...keyboardEvents, ...touchEvents]

        allEvents.forEach((event) => {
            document.addEventListener(event, this.eventHandler)
        })

        this.registeredEvents = allEvents
    }

    /** shared handler so it always uses latest state */
    private eventHandler = () => {
        const isLoggedIn = this.authStateService.isLoggedIn()
        const userSettings = this.userSettingStateService.getState()
        const isPinSet = userSettings.isPinCodeSet
        const isPinEnabled = userSettings.settings.isPinEnabled === 'true'
        if (isLoggedIn && isPinSet && isPinEnabled) {
            this.startLockTimer()
        } else {
            this.clearLockTimer()
        }
    }

    /** remove old listeners */
    private removeEventListeners() {
        this.registeredEvents.forEach((event) => {
            document.removeEventListener(event, this.eventHandler)
        })
        this.registeredEvents = []
    }

    private startLockTimer() {
        this.clearLockTimer()
        this.lockTimer = setTimeout(() => {
            this.lock()
        }, this.idleTime)
    }

    private clearLockTimer() {
        if (this.lockTimer) {
            clearTimeout(this.lockTimer)
            this.lockTimer = null
        }
    }

    lock() {
        this.isLocked.set(true)
        console.log('🔒 Screen locked')
    }

    unlock() {
        this.isLocked.set(false)
        console.log('🔓 Screen unlocked')
    }

    /** lifecycle cleanup */
    ngOnDestroy() {
        this.clearLockTimer()
        this.removeEventListeners()
        this.subscription?.unsubscribe()
    }
}
