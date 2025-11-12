import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { BalanceData, HomeData } from './home.model'

@Injectable({ providedIn: 'root' })
export class HomeApiService extends ApiService<HomeData, HomeData> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/dashboards`)
    }

    getDashboardData(): Observable<ApiResponse<HomeData>> {
        return this.http.get<ApiResponse<HomeData>>(
            `${this.apiUrl}/total-counts`,
        )
    }
}
