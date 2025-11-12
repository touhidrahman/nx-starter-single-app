import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse, OrderBy } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import {
    ApproveSubscriptionRequest,
    SubscriptionRequest,
} from './subscription-request.model'
import { Subscription, SubscriptionDto } from './subscriptions.model'

@Injectable({
    providedIn: 'root',
})
export class SubscriptionsApiService extends ApiService<
    Subscription,
    SubscriptionDto
> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/subscriptions`)
    }

    getAllSubscriptions(filterOptions: {
        search?: string
        size?: number
        page?: number
        orderBy?: OrderBy
        plan?: string
        status?: string
        subscriptionType?: string
    }): Observable<ApiResponse<Subscription[]>> {
        let params = new HttpParams()

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
        if (filterOptions.plan) {
            params = params.set('plan', filterOptions.plan)
        }
        if (filterOptions.status) {
            params = params.set('status', filterOptions.status)
        }
        if (filterOptions.subscriptionType) {
            params = params.set(
                'subscriptionType',
                filterOptions.subscriptionType,
            )
        }

        return this.find(params)
    }

    getSubscriptionsRequestList(filterOptions: {
        search?: string
        size?: number
        page?: number
        orderBy?: OrderBy
        plan?: string
        status?: string
        subscriptionType?: string
    }): Observable<ApiResponse<SubscriptionRequest[]>> {
        let params = new HttpParams()

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
        if (filterOptions.plan) {
            params = params.set('plan', filterOptions.plan)
        }
        if (filterOptions.status) {
            params = params.set('status', filterOptions.status)
        }
        if (filterOptions.subscriptionType) {
            params = params.set(
                'subscriptionType',
                filterOptions.subscriptionType,
            )
        }

        return this.http.get<ApiResponse<SubscriptionRequest[]>>(
            `${this.apiUrl}/requests`,
            { params },
        )
    }

    getSubscriptionByGroupId(
        groupId: string,
    ): Observable<ApiResponse<Subscription>> {
        return this.http.get<ApiResponse<Subscription>>(
            `${this.apiUrl}/${groupId}/subscription`,
        )
    }

    getSubscriptionListByGroupId(): Observable<ApiResponse<Subscription[]>> {
        return this.http.get<ApiResponse<Subscription[]>>(
            `${this.apiUrl}/group/subscription-list`,
        )
    }

    createSubscriptionsRequest(
        items: Subscription,
    ): Observable<ApiResponse<Subscription>> {
        return this.http.post<ApiResponse<Subscription>>(
            `${this.apiUrl}/request`,
            items,
        )
    }

    approveSubscriptionRequest(
        items: ApproveSubscriptionRequest,
    ): Observable<ApiResponse<SubscriptionRequest>> {
        return this.http.put<ApiResponse<SubscriptionRequest>>(
            `${this.apiUrl}/request`,
            items,
        )
    }
}
