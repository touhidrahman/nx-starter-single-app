import { computed, inject } from '@angular/core'
import { JwtHelperService } from '@auth0/angular-jwt'
import { tapResponse } from '@ngrx/operators'
import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withState,
} from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'
import { DateUtil } from '@repo/common-util'
import { isAfter } from 'date-fns'
import { of, pipe, switchMap } from 'rxjs'
import { AuthApiService } from './auth-api.service'
import { TokenStorageService } from './token-storage.service'

export interface CommonAuthState {
    accessToken: string
    user: any | null
    expiry: Date | null
    lastUpdated: Date | null
}

export const initialAuthState: CommonAuthState = {
    accessToken: '',
    user: null,
    expiry: null,
    lastUpdated: null,
}

export const AuthStore = signalStore(
    { providedIn: 'root' },

    withState(initialAuthState),

    withComputed((store) => ({
        isLoggedIn: computed(() => {
            const expiry = store.expiry()
            return expiry ? isAfter(expiry, new Date()) : false
        }),
    })),

    withMethods(
        (
            store,
            authApiService = inject(AuthApiService),
            // userRestApiService = inject(UserRestApiService),
            tokenStorageService = inject(TokenStorageService),
        ) => ({
            setAccessToken: rxMethod<string>(
                pipe(
                    switchMap((token) => {
                        if (!token) of(null)

                        const dateUtil = DateUtil

                        const { email, exp, sub } = new JwtHelperService().decodeToken(token)
                        const expiry = dateUtil.date(Number(exp) * 1000)

                        patchState(store, {
                            accessToken: token,
                            expiry,
                            lastUpdated: new Date(),
                        })

                        tokenStorageService.saveAccessToken(token)

                        // TODO: Fetch user data by id
                        return authApiService.getMe(/* sub */)
                    }),
                    tapResponse({
                        next: (res) => {
                            res &&
                                patchState(store, {
                                    user: res,
                                })
                        },
                        error: (err) => console.error(err),
                    }),
                ),
            ),

            logout: () => {
                patchState(store, {
                    accessToken: '',
                    user: null,
                    expiry: null,
                    lastUpdated: null,
                })
                tokenStorageService.clear()
            },
        }),
    ),

    withHooks({
        onInit: (store) => {
            const tokenStorageService = inject(TokenStorageService)
            const accessToken = tokenStorageService.getAccessToken()
            if (accessToken) {
                store.setAccessToken(accessToken)
            }
        },
    }),
)
