import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { Observable } from 'rxjs'
import { AUTH_API_URL } from '../auth-injectors'
import { Group, GroupInput } from '../models/group'
import { LoginResponse } from '../models/login-response'
import { AdminSignupInput } from '../models/signup-input'

@Injectable({
    providedIn: 'root',
})
export class AdminAuthApiService<TUser> {
    private http = inject(HttpClient)
    private authApiUrl = inject(AUTH_API_URL)

    getMe(): Observable<ApiResponse<TUser>> {
        return this.http.get<ApiResponse<TUser>>(`${this.authApiUrl}/admin`)
    }

    isSuperAdmin(userId: string): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(
            `${this.authApiUrl}/${userId}/is-admin`,
            {},
        )
    }

    login(
        identifier: string,
        password: string,
    ): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(
            `${this.authApiUrl}/admin/login`,
            {
                identifier,
                password,
            },
        )
    }

    register(input: AdminSignupInput): Observable<ApiResponse<TUser>> {
        return this.http.post<ApiResponse<TUser>>(
            `${this.authApiUrl}/admin/first`,
            input,
        )
    }

    refreshAccessToken(
        refreshToken: string,
    ): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(
            `${this.authApiUrl}/token`,
            {
                refreshToken,
            },
        )
    }

    changePassword(
        userId: number,
        currentPassword: string,
        password: string,
        // passwordConfirmation?: string,
    ): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(
            `${this.authApiUrl}/change-password`,
            {
                userId,
                password,
                currentPassword,
                // passwordConfirmation,
            },
        )
    }

    forgotPassword(email: string): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(
            `${this.authApiUrl}/forgot-password`,
            { email },
        )
    }

    resetPassword(
        token: string,
        email: string,
        password: string,
    ): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(
            `${this.authApiUrl}/reset-password/${token}'`,
            {
                email,
                password,
            },
        )
    }

    logout(): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(
            `${this.authApiUrl}/admin/logout`,
            {},
        )
    }

    verifyEmail(token: string): Observable<ApiResponse<boolean>> {
        return this.http.get<ApiResponse<boolean>>(
            `${this.authApiUrl}/verify-email/${token}`,
        )
    }

    createGroup(
        input: Partial<GroupInput>,
        type: 'client' | 'vendor',
    ): Observable<ApiResponse<Group>> {
        return this.http.post<ApiResponse<Group>>(
            `${this.authApiUrl}/create-profile/${type}`,
            input,
        )
    }
}
