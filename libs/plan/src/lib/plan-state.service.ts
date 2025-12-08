import { Injectable, inject } from '@angular/core'
import { OrderBy } from '@repo/common-models'
import { SimpleStore } from '@repo/store'
import { catchError, combineLatest, debounceTime, finalize, switchMap, tap, throwError } from 'rxjs'
import { Plan } from './plan.model'
import { PlanApiService } from './plan-api.service'

export type PlanState = {
    plans: Plan[]
    loading: boolean
    error: boolean
    orderBy: OrderBy
    pageNumber: number
    pageSize: number
    search: string
    totalItems: number
    totalPages: number
}

const initialPlanState: PlanState = {
    plans: [],
    loading: false,
    error: false,
    orderBy: OrderBy.Asc,
    pageNumber: 1,
    pageSize: 10,
    search: '',
    totalItems: 0,
    totalPages: 1,
}

@Injectable()
export class PlanStateService extends SimpleStore<PlanState> {
    private planApiService = inject(PlanApiService)

    constructor() {
        super(initialPlanState)
    }

    init() {
        this.continueLoadingPlans()
    }

    pushPlan(plan: Plan) {
        this.setState({
            plans: [...this.getState().plans, plan],
        })
    }

    replacePlan(Plan: Plan) {
        this.setState({
            plans: this.getState().plans.map((b) => (b.id === Plan.id ? Plan : b)),
        })
    }

    private continueLoadingPlans() {
        combineLatest([
            this.select('search'),
            this.select('pageNumber'),
            this.select('pageSize'),
            this.select('orderBy'),
        ])
            .pipe(
                debounceTime(200),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, pageNumber, pageSize, orderBy]) => {
                    const size = pageSize
                    const page = pageNumber
                    return this.planApiService.getAllPlans({
                        search,
                        page,
                        size,
                        orderBy,
                    })
                }),
            )
            .subscribe({
                next: ({ data, pagination }) => {
                    this.setState({
                        plans: data,
                        loading: false,
                        totalItems: pagination?.total ?? 0,
                        totalPages: Math.ceil((pagination?.total ?? 0) / (pagination?.size ?? 1)),
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

    deletePlan(id: string) {
        this.setState({ loading: true })
        return this.planApiService.delete(id).pipe(
            tap(() =>
                this.setState({
                    loading: true,
                    plans: this.getState().plans.filter((plan) => plan.id !== id),
                }),
            ),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete plan.'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }
}
