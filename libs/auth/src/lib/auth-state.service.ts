import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt'
import {
    AuthApiService,
    Group,
    LoginResponse,
    SignupForm,
    TokenSharingService,
    TokenStorageService,
} from '@repo/common-auth'
import { LocalStorageService } from '@repo/common-services'
import { Role } from '@repo/role-permission'
import { User, UserLevel, UserResponse } from '@repo/user'
import { SimpleStore } from '@repo/store'
import destr from 'destr'
import { catchError, map, of, throwError, timer } from 'rxjs'
import { AccessTokenPayload } from './token.model'

export interface AuthState {
    isLoggedIn: boolean
    tokenPayload: AccessTokenPayload | null
    user: User | null
    role: Role | null
    group: Group | null
}

export const initialAuthState: AuthState = {
    isLoggedIn: false,
    tokenPayload: null,
    user: null,
    role: null,
    group: null,
}

@Injectable({
    providedIn: 'root',
})
export class AuthStateService extends SimpleStore<AuthState> {
    private refreshTokenTimeout?: any
    private reloadTimerSubscription?: any
    private jwtHelper = new JwtHelperService()
    private tokenStorageService = inject(TokenStorageService)
    private authApiService =
        inject<AuthApiService<User, UserResponse>>(AuthApiService)
    private router = inject(Router)
    private localStorageService = inject(LocalStorageService)
    private tokenSharingService = inject(TokenSharingService)

    constructor() {
        super(initialAuthState)
        this.initAuthFromStorage()
        // this.logging()
    }

    getUser(): User | null {
        return this.getState().user
    }

    getGroup(): Group | null {
        return this.getState().group
    }

    getRole(): Role | null {
        return this.getState().role
    }

    hasPermission(claim: string): boolean {
        return this.getPermissions().includes(claim) || false
    }

    getPermissions(): string[] {
        return this.getState().role?.claims || []
    }

    isGroupOwner(): boolean {
        return this.getUser()?.id === this.getGroup()?.ownerId
    }

    getUserId(): string | null {
        return this.getState().tokenPayload?.sub ?? null
    }

    getUserEmail(): string | null {
        return this.getState().tokenPayload?.email ?? null
    }

    getUserRoleId(): string | null {
        return this.getState().tokenPayload?.roleId ?? null
    }

    getUserFirstName(): string | null {
        return this.getState().tokenPayload?.firstName ?? null
    }

    getUserLastName(): string | null {
        return this.getState().tokenPayload?.lastName ?? null
    }

    getUserLevel(): UserLevel | null {
        return this.getState().tokenPayload?.level ?? null
    }

    getGroupOwnerCount(): number {
        return this.getState().tokenPayload?.groupOwnerCount ?? 0
    }

    getGroupId(): string | null {
        return this.getState().tokenPayload?.groupId || null
    }

    getGroupType(): string | null {
        return this.getState().tokenPayload?.groupType || null
    }

    isLoggedIn(): boolean {
        return this.getState().isLoggedIn
    }

    isSuperAdmin(): boolean {
        return this.getState().tokenPayload?.level === UserLevel.Admin
    }

    login(username: string, password: string) {
        return this.authApiService.login(username, password).pipe(
            map(({ data }) => {
                if (data) {
                    this.setStateAfterLogin(data)
                }
                return data
            }),
            catchError((error) => {
                return throwError(
                    () => new Error(error?.error?.message || 'Login failed'),
                )
            }),
        )
    }

    register(signupInput: SignupForm) {
        return this.authApiService.register(signupInput)
    }

    switchOrg(groupId: string) {
        return this.authApiService.switchOrg(groupId).pipe(
            map(({ data }) => {
                if (data) {
                    this.setStateAfterLogin(data)
                }
                return data
            }),
            catchError((error) => {
                return throwError(
                    () =>
                        new Error(
                            error?.error?.message || 'Switch group failed',
                        ),
                )
            }),
        )
    }

    initAuthFromStorage() {
        const accessToken = this.tokenStorageService.getAccessToken()
        const refreshToken = this.tokenStorageService.getRefreshToken()

        if (!accessToken || !refreshToken) {
            return
        }

        if (this.jwtHelper.isTokenExpired(accessToken)) {
            this.tokenStorageService.clear()
            return
        }

        const user = destr<User>(this.localStorageService.getItem('user'))
        const group = destr<Group>(this.localStorageService.getItem('group'))
        const role = destr<Role>(this.localStorageService.getItem('role'))
        const tokenPayload =
            this.jwtHelper.decodeToken<AccessTokenPayload>(accessToken)

        this.setState({
            isLoggedIn: true,
            user,
            group,
            role,
            tokenPayload,
        })

        if (tokenPayload) {
            this.startRefreshTokenTimer(tokenPayload.exp)
        }
    }

    refreshAccessToken() {
        const refreshToken = this.tokenStorageService.getRefreshToken()

        return this.authApiService.refreshAccessToken(refreshToken ?? '').pipe(
            map(({ data }) => {
                if (data) {
                    this.setStateAfterLogin(data)
                }

                return data
            }),
            catchError((_err) => {
                // this.logout()
                return of(null)
            }),
        )
    }

    setStateAfterLogin(loginResponse: LoginResponse) {
        const decoded = this.jwtHelper.decodeToken<AccessTokenPayload>(
            loginResponse.accessToken,
        )

        this.setState({
            tokenPayload: decoded,
            user: loginResponse.user,
            group: loginResponse.group,
            role: loginResponse.role,
            isLoggedIn: true,
        })
        this.saveToStorage(loginResponse)
        const exp = decoded?.exp || 0
        exp && this.startRefreshTokenTimer(exp)
    }

    logout(redirectPath = '', reload = false) {
        this.reset()
        this.stopRefreshTokenTimer()
        this.stopReloadTimer()
        this.tokenStorageService.clear()
        this.localStorageService.clear()
        this.tokenSharingService.broadcastLogout()
        this.router.navigate([redirectPath])

        if (reload) {
            this.reload()
        }
    }

    private reload() {
        this.stopReloadTimer()
        this.reloadTimerSubscription = timer(1000).subscribe(() =>
            window.location.reload(),
        )
    }

    private stopReloadTimer() {
        if (this.reloadTimerSubscription) {
            this.reloadTimerSubscription.unsubscribe()
            this.reloadTimerSubscription = undefined
        }
    }

    private saveToStorage(res: LoginResponse) {
        this.localStorageService.setItem('user', JSON.stringify(res.user))
        this.localStorageService.setItem('group', JSON.stringify(res.group))
        this.localStorageService.setItem('role', JSON.stringify(res.role))

        this.tokenStorageService.saveAccessToken(res.accessToken)
        this.tokenStorageService.saveRefreshToken(res.refreshToken)
    }

    private startRefreshTokenTimer(_expiry: number) {
        const timeout = 5 * 60 * 1000 // 5 minutes
        this.stopRefreshTokenTimer()
        this.refreshTokenTimeout = setTimeout(
            () => this.refreshAccessToken().subscribe(),
            timeout,
        )
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout)
    }
}
