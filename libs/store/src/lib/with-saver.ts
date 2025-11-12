import { effect, inject } from '@angular/core'
import { LocalStorageService } from '@repo/common-services'
import { getState, signalStoreFeature, withHooks } from '@ngrx/signals'
import { omit } from 'radash'

export function withSaver(name: string, exclude = []) {
    return signalStoreFeature(
        withHooks({
            onInit(store) {
                const localStorageService = inject(LocalStorageService)
                effect(() => {
                    const state = omit(getState(store), exclude)
                    localStorageService.setItem(name, JSON.stringify(state))
                })
            },
        }),
    )
}
