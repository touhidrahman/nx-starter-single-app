import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { ReferralCode, ReferralPoints, ReferredUser } from './referralCode.model'

@Injectable({
    providedIn: 'root',
})
export class ReferralApiService {
    private http = inject(HttpClient)
    private env = inject<AppEnvironmentConfig>(APP_ENVIRONMENT)
    private apiUrl = `${this.env.apiUrl}/v1/referral-code`

    generateReferralCode(): Observable<ApiResponse<ReferralCode>> {
        return this.http.post<ApiResponse<ReferralCode>>(`${this.apiUrl}/generate`, {
            withCredentials: true,
        })
    }

    getReferralCode(): Observable<ApiResponse<ReferralCode>> {
        return this.http.get<ApiResponse<ReferralCode>>(`${this.apiUrl}`)
    }

    getReferralPoints(): Observable<ApiResponse<ReferralPoints>> {
        return this.http.get<ApiResponse<ReferralPoints>>(`${this.env.apiUrl}/v1/referral-points`)
    }

    getReferredUsers(): Observable<ApiResponse<ReferredUser[]>> {
        return this.http.get<ApiResponse<ReferredUser[]>>(`${this.env.apiUrl}/v1/referred-users`)
    }
}
