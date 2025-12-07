import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt'
import {
    AdminAuthApiService,
    AdminSignupInput,
    TokenSharingService,
    TokenStorageService,
} from '@repo/common-auth'
import { LocalStorageService } from '@repo/common-services'
import { AdminUser } from '@repo/user'
import { SimpleStore } from '@repo/store'
import { catchError, map, of, timer } from 'rxjs'
import { AdminAccessTokenPayload } from './token.model'

export interface AdminAuthState {
    isLoggedIn: boolean
    accessToken: string
    refreshToken: string
    userId: string | null
    name: string | null
    email: string | null
    level: string
    lastUpdated: Date | null
}

const initialAdminAuthState: AdminAuthState = {
    isLoggedIn: false,
    accessToken: '',
    refreshToken: '',
    userId: null,
    name: null,
    email: null,
    level: '',
    lastUpdated: null,
}

@Injectable({
    providedIn: 'root',
})
export class AdminAuthStateService extends SimpleStore<AdminAuthState> {
    private refreshTokenTimeout?: any
    private jwtHelper = new JwtHelperService()
    private tokenStorageService = inject(TokenStorageService)
    private adminAuthApiService = inject<AdminAuthApiService<AdminUser>>(AdminAuthApiService)
    private router = inject(Router)
    private localStorageService = inject(LocalStorageService)
    private tokenSharingService = inject(TokenSharingService)

    constructor() {
        super(initialAdminAuthState)
        // this.initAuthFromStorage()
    }

    getUserId(): string | null {
        return this.getState().userId
    }

    getUserEmail(): string | null {
        return this.getState().email
    }

    getLoginStatus(): boolean {
        return this.getState().isLoggedIn
    }

    getUserLevel(): string {
        return this.getState().level
    }

    isLoggedIn(): boolean {
        return this.getState().isLoggedIn
    }

    login(username: string, password: string) {
        return this.adminAuthApiService.login(username, password).pipe(
            map(({ data }) => {
                if (data) {
                    this.setStateAfterLogin(data.accessToken, data.refreshToken)
                }
                return data
            }),
        )
    }

    register(signupInput: AdminSignupInput) {
        return this.adminAuthApiService.register(signupInput).pipe()
    }

    initAuthFromStorage() {
        const accessToken = this.tokenStorageService.getAccessToken()
        const refreshToken = this.tokenStorageService.getRefreshToken()

        if (!accessToken || !refreshToken || this.jwtHelper.isTokenExpired(accessToken)) {
            this.clearState()
            return
        }

        this.setStateAfterLogin(accessToken, refreshToken)
    }

    refreshAccessToken() {
        const refreshToken = this.tokenStorageService.getRefreshToken()

        if (!refreshToken) {
            this.logout()
            return of(null)
        }

        return this.adminAuthApiService.refreshAccessToken(refreshToken).pipe(
            map(({ data }) => {
                if (data) {
                    this.setStateAfterLogin(data.accessToken, data.refreshToken)
                }
                return data
            }),
            catchError((err) => {
                console.error('Failed to refresh access token:', err)
                this.logout()
                return of(null)
            }),
        )
    }

    setStateAfterLogin(accessToken: string, refreshToken: string) {
        const decoded = this.jwtHelper.decodeToken<AdminAccessTokenPayload>(accessToken)

        if (!decoded) {
            console.error('Invalid token payload')
            return
        }

        this.setState({
            accessToken,
            refreshToken,
            isLoggedIn: true,
            userId: decoded.sub,
            email: decoded.email,
            level: decoded.level || '',
            lastUpdated: new Date(),
        })

        // this.saveInLocalStorage()
        this.saveInLocalStorage(accessToken, refreshToken)
        const exp = decoded?.exp || 0
        exp && this.startRefreshTokenTimer(exp)
    }

    logout(redirectPath = '', reload = false) {
        // this.adminAuthApiService.logout().subscribe()
        this.reset()
        this.clearState()
        this.router.navigate([redirectPath])
        this.stopRefreshTokenTimer()
        this.localStorageService.clear()
        this.tokenSharingService.broadcastLogout()
        timer(1000).subscribe(() => reload && window.location.reload())
    }

    private clearState() {
        // this.setState(initialAuthState)
        this.tokenStorageService.clear()
        this.stopRefreshTokenTimer()
    }
    private saveInLocalStorage(accessToken: string, refreshToken: string) {
        this.tokenStorageService.saveAccessToken(accessToken)
        this.tokenStorageService.saveRefreshToken(refreshToken)
    }

    private startRefreshTokenTimer(_expiry: number) {
        const timeout = 5 * 60 * 1000 // 5 minutes
        this.stopRefreshTokenTimer()
        this.refreshTokenTimeout = setTimeout(() => this.refreshAccessToken().subscribe(), timeout)
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout)
    }
}
