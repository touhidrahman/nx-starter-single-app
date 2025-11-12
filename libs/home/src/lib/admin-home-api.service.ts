import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { BalanceData } from './home.model'

@Injectable({ providedIn: 'root' })
export class AdminHomeApiService extends ApiService<BalanceData, BalanceData> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1`)
    }

    getSmsBalanceData(): Observable<ApiResponse<BalanceData>> {
        return this.http.get<ApiResponse<BalanceData>>(
            `${this.apiUrl}/sms/balance`,
        )
    }
}
