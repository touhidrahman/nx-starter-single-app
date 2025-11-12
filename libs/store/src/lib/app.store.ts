import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'

export type AppState = {
    appName: string
    loading: boolean
}

export const appInitialState: AppState = {
    appName: '',
    loading: true,
}

export const RootAppStore = signalStore(
    { providedIn: 'root' },

    withState<AppState>(appInitialState),

    withMethods((store) => ({
        startLoading() {
            patchState(store, { loading: true })
        },

        stopLoading() {
            patchState(store, { loading: false })
        },

        setLoading(loading: boolean) {
            patchState(store, { loading })
        },

        setAppName(appName: string) {
            patchState(store, { appName })
        },
    })),
)
