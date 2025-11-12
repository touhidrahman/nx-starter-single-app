import { effect } from '@angular/core'
import { getState, signalStoreFeature, withHooks } from '@ngrx/signals'

export function withLogger(_name: string) {
    return signalStoreFeature(
        withHooks({
            onInit(store) {
                effect(() => {
                    const state = getState(store)
                })
            },
        }),
    )
}
