import { Injectable, inject } from '@angular/core'
import { OrderBy } from '@repo/common-models'
import { SimpleStore } from '@repo/store'
import {
    catchError,
    combineLatest,
    debounceTime,
    finalize,
    switchMap,
    tap,
    throwError,
} from 'rxjs'
import { SubscriptionRequest } from './subscription-request.model'
import { SubscriptionStatus, SubscriptionType } from './subscriptions.model'
import { SubscriptionsApiService } from './subscriptions-api.service'

export type SubscriptionRequestState = {
    subscriptionsRequests: SubscriptionRequest[]
    loading: boolean
    error: boolean
    orderBy: OrderBy
    page: number
    size: number
    search: string
    totalItems: number
    totalPages: number
    plan?: string
    subscriptionType?: SubscriptionType
    status?: SubscriptionStatus
}

const initialSubscriptionRequestState: SubscriptionRequestState = {
    subscriptionsRequests: [],
    loading: false,
    error: false,
    orderBy: OrderBy.Asc,
    page: 1,
    size: 10,
    search: '',
    totalItems: 0,
    totalPages: 1,
    plan: undefined,
    subscriptionType: undefined,
    status: undefined,
}

@Injectable()
export class SubscriptionRequestStateService extends SimpleStore<SubscriptionRequestState> {
    private subscriptionsApiService = inject(SubscriptionsApiService)

    constructor() {
        super(initialSubscriptionRequestState)
    }

    init() {
        this.continueLoadingSubscriptionsRequests()
    }

    updateSubscriptionRequest(id: string, groupId: string) {
        const { subscriptionsRequests } = this.getState()
        this.setState({ loading: true })
        const updateItem = {
            groupId,
            id,
        }

        return this.subscriptionsApiService
            .approveSubscriptionRequest(updateItem)
            .pipe(
                tap((value) => {
                    if (value.data) {
                        this.updateSubscriptionRequestState(
                            id,
                            value.data,
                            subscriptionsRequests,
                        )
                    }
                }),
                catchError(() => {
                    this.setState({ error: true })
                    return throwError(
                        () =>
                            new Error('Failed to approve subscription request'),
                    )
                }),
                finalize(() => this.setState({ loading: false })),
            )
    }

    updateRequest(id: string, value: SubscriptionRequest) {
        const { subscriptionsRequests } = this.getState()
        this.updateSubscriptionRequestState(id, value, subscriptionsRequests)
    }

    private continueLoadingSubscriptionsRequests() {
        combineLatest([
            this.select('search'),
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
            this.select('plan'),
            this.select('subscriptionType'),
            this.select('status'),
        ])
            .pipe(
                debounceTime(200),
                tap(() => this.setState({ loading: true })),
                switchMap(
                    ([
                        search,
                        page,
                        size,
                        orderBy,
                        plan,
                        subscriptionType,
                        status,
                    ]) => {
                        return this.subscriptionsApiService.getSubscriptionsRequestList(
                            {
                                search,
                                page,
                                size,
                                orderBy,
                                plan,
                                subscriptionType,
                                status,
                            },
                        )
                    },
                ),
            )
            .subscribe({
                next: ({ data, pagination }) => {
                    this.setState({
                        subscriptionsRequests: data,
                        loading: false,
                        totalItems: pagination?.total ?? 0,
                        page: pagination?.page ?? 1,
                        size: pagination?.size ?? 10,
                        totalPages: Math.ceil(
                            (pagination?.total ?? 0) / (pagination?.size ?? 10),
                        ),
                    })
                },
                error: () => {
                    this.setState({
                        loading: false,
                        error: true,
                    })
                },
            })
    }

    private updateSubscriptionRequestState(
        id: string,
        updatedRequest: SubscriptionRequest,
        currentRequests: SubscriptionRequest[],
    ) {
        this.setState({
            subscriptionsRequests: [
                ...currentRequests.filter((c) => c.id !== id),
                updatedRequest,
            ],
        })
    }

    applyFilters(filters: {
        plan?: string
        subscriptionType?: SubscriptionType
        status?: SubscriptionStatus
    }) {
        this.setState({
            ...filters,
            page: 1,
        })
    }

    resetFilters() {
        this.setState({
            plan: undefined,
            subscriptionType: undefined,
            status: undefined,
            page: 1,
        })
    }
}
