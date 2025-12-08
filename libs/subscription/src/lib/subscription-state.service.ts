import { Injectable, inject } from '@angular/core'
import { OrderBy } from '@repo/common-models'
import { SimpleStore } from '@repo/store'
import { combineLatest, debounceTime, switchMap, tap } from 'rxjs'
import { Subscription, SubscriptionStatus, SubscriptionType } from './subscriptions.model'
import { SubscriptionsApiService } from './subscriptions-api.service'

export type SubscriptionState = {
    subscriptions: Subscription[]
    currentSubscription: Subscription | null
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

const initialSubscriptionState: SubscriptionState = {
    subscriptions: [],
    currentSubscription: null,
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
export class SubscriptionStateService extends SimpleStore<SubscriptionState> {
    private subscriptionsApiService = inject(SubscriptionsApiService)

    constructor() {
        super(initialSubscriptionState)
    }

    init() {
        this.continueLoadingSubscriptions()
    }

    getSubscriptionByGroupId(groupId: string) {
        this.setState({ loading: true })

        this.subscriptionsApiService.getSubscriptionByGroupId(groupId).subscribe({
            next: (response) => {
                this.setState({
                    currentSubscription: response.data,
                    loading: false,
                    error: false,
                })
            },
            error: (_err) => {
                this.setState({
                    loading: false,
                    error: true,
                    currentSubscription: null,
                })
            },
        })
    }

    getSubscriptionListByGroupId(groupId: string) {
        this.setState({ loading: true })

        this.subscriptionsApiService.getSubscriptionByGroupId(groupId).subscribe({
            next: (response) => {
                this.setState({
                    subscriptions: response.data ? [response.data] : [],
                    loading: false,
                    error: false,
                })
            },
            error: (_err) => {
                this.setState({
                    loading: false,
                    error: true,
                    subscriptions: [],
                })
            },
        })
    }

    private continueLoadingSubscriptions() {
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
                switchMap(([search, page, size, orderBy, plan, subscriptionType, status]) => {
                    return this.subscriptionsApiService.getAllSubscriptions({
                        search,
                        page,
                        size,
                        orderBy,
                        plan,
                        subscriptionType,
                        status,
                    })
                }),
            )
            .subscribe({
                next: ({ data, pagination }) => {
                    this.setState({
                        subscriptions: data,
                        loading: false,
                        totalItems: pagination?.total ?? 0,
                        page: pagination?.page ?? 1,
                        size: pagination?.size ?? 10,
                        totalPages: Math.ceil((pagination?.total ?? 0) / (pagination?.size ?? 10)),
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
