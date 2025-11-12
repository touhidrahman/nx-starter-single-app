import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { Feedback, FeedbackDto } from './feedback.model'

@Injectable({
    providedIn: 'root',
})
export class FeedbackApiService extends ApiService<Feedback, FeedbackDto> {
    baseUrl: string

    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/feedback`)
        this.baseUrl = `${env.apiUrl}/v1/feedback`
    }

    createFeedback(formData: FormData): Observable<ApiResponse<Feedback>> {
        return this.http.post<ApiResponse<Feedback>>(this.baseUrl, formData)
    }

    updateFeedback(
        id: string,
        payload: { status: string },
    ): Observable<ApiResponse<Feedback>> {
        return this.http.patch<ApiResponse<Feedback>>(
            `${this.env.apiUrl}/v1/feedback/${id}`,
            payload,
        )
    }

    getAllFeedbacks(filterOptions: {
        search: string
        page: number
        size: number
        orderBy: 'asc' | 'desc'
    }): Observable<ApiResponse<Feedback[]>> {
        let params = new HttpParams()

        if (filterOptions.search) {
            params = params.set('search', filterOptions.search)
        }
        if (filterOptions.page !== undefined) {
            params = params.set('page', filterOptions.page.toString())
        }
        if (filterOptions.size !== undefined) {
            params = params.set('size', filterOptions.size.toString())
        }
        if (filterOptions.orderBy !== undefined) {
            params = params.set('orderBy', filterOptions.orderBy)
        }

        return this.find(params)
    }
}
