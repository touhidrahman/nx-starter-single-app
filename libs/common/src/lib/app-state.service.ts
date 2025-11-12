import { Injectable } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { UserApiService } from '@repo/user'
import { SimpleStore } from '@repo/store'
import { BehaviorSubject } from 'rxjs'

export interface AppState {
    currency: 'USD' | 'BDT'
    language: 'en' | 'bn'
    theme: 'dark' | 'light'
}

export const initialState: AppState = {
    currency: 'BDT',
    language: 'bn',
    theme: 'light',
}

/**
 * Stores crucial information and functionalities for the app's full lifecycle
 */
@Injectable({
    providedIn: 'root',
})
export class AppStateService extends SimpleStore<AppState> {
    private loadingSubject = new BehaviorSubject<boolean>(true)
    appName = 'Material Test'

    constructor(
        private authStateService: AuthStateService,
        private userApiService: UserApiService,
    ) {
        super(initialState)
    }

    get loading(): boolean {
        return this.loadingSubject.value
    }

    startLoading(): void {
        this.loadingSubject.next(true)
    }

    stopLoading(): void {
        this.loadingSubject.next(false)
    }

    setLoading(loading: boolean): void {
        this.loadingSubject.next(loading)
    }
}
