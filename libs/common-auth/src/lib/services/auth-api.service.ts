import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ForgotPassword, UserVerificationStatusCheck } from '@repo/auth'
import { UserSettingsDto } from '@repo/user-setting'
import { Observable } from 'rxjs'
import { AUTH_API_URL } from '../auth-injectors'
import { Group, GroupInput, GroupType } from '../models/group'
import { LoginResponse } from '../models/login-response'
import { resendVerification } from '../models/resend-verification'
import { SignupForm, SignupInput } from '../models/signup-input'

@Injectable({
    providedIn: 'root',
})
export class AuthApiService<TUser, TSignupResponse> {
    private http = inject(HttpClient)
    private authApiUrl = inject(AUTH_API_URL)

    getMe(): Observable<ApiResponse<TUser>> {
        return this.http.get<ApiResponse<TUser>>(`${this.authApiUrl}/me`)
    }

    isSuperAdmin(userId: string): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.authApiUrl}/${userId}/is-admin`, {})
    }

    login(identifier: string, password: string): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.authApiUrl}/login`, {
            identifier,
            password,
        })
    }

    switchOrg(groupId: string): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(
            `${this.authApiUrl}/group-switch/${groupId}`,
            {},
        )
    }

    register(input: SignupForm): Observable<ApiResponse<TSignupResponse>> {
        return this.http.post<ApiResponse<TSignupResponse>>(`${this.authApiUrl}/register`, input)
    }

    adminRegister(input: SignupInput): Observable<ApiResponse<TUser>> {
        return this.http.post<ApiResponse<TUser>>(`${this.authApiUrl}/admin/register`, input)
    }

    refreshAccessToken(refreshToken: string): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.authApiUrl}/token`, {
            refreshToken,
        })
    }

    changePassword(
        userId: string,
        currentPassword: string,
        password: string,
        // passwordConfirmation?: string,
    ): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.authApiUrl}/change-password`, {
            userId,
            password,
            currentPassword,
            // passwordConfirmation,
        })
    }

    forgotPassword(identifier: string): Observable<ApiResponse<ForgotPassword>> {
        return this.http.post<ApiResponse<ForgotPassword>>(`${this.authApiUrl}/forgot-password`, {
            identifier,
        })
    }

    resetPassword(
        token: string,
        email: string,
        phone: string,
        code: string,
        password: string,
    ): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.authApiUrl}/reset-password/${token}`, {
            email,
            phone,
            code,
            password,
        })
    }

    verifyEmail(token: string): Observable<ApiResponse<{ id: string }>> {
        return this.http.post<ApiResponse<{ id: string }>>(
            `${this.authApiUrl}/verify-email/${token}`,
            {},
        )
    }

    verifyPhone(data: {
        token?: string
        phone: string
        verificationCode: number
    }): Observable<ApiResponse<{ id: string }>> {
        return this.http.post<ApiResponse<{ id: string }>>(
            `${this.authApiUrl}/verify-phone/${data.token}`,
            data,
        )
    }

    checkUserVerificationStatus(
        identifier: string,
    ): Observable<ApiResponse<UserVerificationStatusCheck>> {
        return this.http.post<ApiResponse<UserVerificationStatusCheck>>(
            `${this.authApiUrl}/check-user-verification-status`,
            { identifier },
        )
    }

    resendVerification(identifier: string): Observable<ApiResponse<resendVerification>> {
        return this.http.post<ApiResponse<resendVerification>>(
            `${this.authApiUrl}/resend-verification`,
            { identifier },
        )
    }

    createGroup(input: Partial<GroupInput>, type: GroupType): Observable<ApiResponse<Group>> {
        return this.http.post<ApiResponse<Group>>(
            `${this.authApiUrl}/create-profile/${type}`,
            input,
        )
    }

    enablePin(): Observable<ApiResponse<UserSettingsDto>> {
        return this.http.post<ApiResponse<UserSettingsDto>>(
            `${this.authApiUrl}/auth/enable-pin`,
            {},
        )
    }

    verifyPinCode(pin: string): Observable<ApiResponse<{ verified: boolean }>> {
        return this.http.post<ApiResponse<{ verified: boolean }>>(
            `${this.authApiUrl}/auth/verify-pin`,
            { pin },
        )
    }

    forgotPIN(method: string): Observable<ApiResponse<{ success: boolean }>> {
        return this.http.post<ApiResponse<{ success: boolean }>>(
            `${this.authApiUrl}/auth/forgot-pin`,
            {
                method,
            },
        )
    }
}
