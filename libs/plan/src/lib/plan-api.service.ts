import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse, OrderBy } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { Plan, PlanDto } from './plan.model'

@Injectable({
    providedIn: 'root',
})
export class PlanApiService extends ApiService<Plan, PlanDto> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/plans`)
    }

    getAllPlans(filterOptions: {
        search: string
        size: number
        page: number
        orderBy: OrderBy
    }): Observable<ApiResponse<Plan[]>> {
        let params = new HttpParams({})

        if (params) {
            if (filterOptions.search) {
                params = params.set('search', filterOptions.search)
            }
            if (filterOptions.page !== undefined) {
                params = params.set('page', filterOptions.page)
            }
            if (filterOptions.size !== undefined) {
                params = params.set('size', filterOptions.size)
            }
            if (filterOptions.orderBy !== undefined) {
                params = params.set('orderBy', filterOptions.orderBy)
            }
        }
        return this.find(params)
    }
}
