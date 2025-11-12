import { Injectable, inject } from '@angular/core'
import { SimpleStore } from '@repo/store'
import {
    catchError,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    switchMap,
    tap,
    throwError,
} from 'rxjs'
import { FeedbackApiService } from './feedback.api.service'
import { Feedback, FeedbackStatus } from './feedback.model'

interface FeedbacksListState {
    feedbacks: Feedback[]
    loading: boolean
    error: boolean
    search: string
    orderBy: 'asc' | 'desc'
    page: number
    size: number
    total: number
    totalPages: number
}

const initialState: FeedbacksListState = {
    feedbacks: [],
    loading: false,
    error: false,
    search: '',
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    orderBy: 'desc',
}

@Injectable({
    providedIn: 'root',
})
export class FeedbacksListStateService extends SimpleStore<FeedbacksListState> {
    private feedbackApiService = inject(FeedbackApiService)
    // Options for dropdowns
    statusOptions = [
        { label: 'Pending', value: FeedbackStatus.PENDING },
        { label: 'In Progress', value: FeedbackStatus.INPROGRESS },
        { label: 'Complete', value: FeedbackStatus.COMPLETE },
        { label: 'Incomplete', value: FeedbackStatus.INCOMPLETE },
    ]
    constructor() {
        super(initialState)
    }

    init() {
        this.continueLoadingFeedbacks()
    }

    private continueLoadingFeedbacks() {
        combineLatest([
            this.select('search'),
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
        ])
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, page, size, orderBy]) => {
                    return this.feedbackApiService.getAllFeedbacks({
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
                        loading: false,
                        feedbacks: data,
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? 1,
                        size: pagination?.size ?? 10,
                    })
                },
                error: (_err) => {
                    this.setState({ loading: false, error: true })
                },
            })
    }

    pushFeedback(feedback: Feedback) {
        this.setState({
            feedbacks: [...this.getState().feedbacks, feedback],
        })
    }

    replaceFeedback(feedback: Feedback) {
        this.setState({
            feedbacks: this.getState().feedbacks.map((b) =>
                b.id === feedback.id ? feedback : b,
            ),
        })
    }

    deleteFeedBack(id: string) {
        this.setState({ loading: true })
        return this.feedbackApiService.delete(id).pipe(
            tap(() => {
                const updatedFeedbacks = this.getState().feedbacks.filter(
                    (feedBack) => feedBack.id !== id,
                )
                this.setState({
                    feedbacks: updatedFeedbacks,
                    loading: false,
                })
            }),
            catchError((error) => {
                this.setState({ loading: false, error: true })
                return throwError(() => error)
            }),
        )
    }

    getStatusLabel(statusValue: FeedbackStatus): string {
        const status = this.statusOptions.find(
            (opt) => opt.value === statusValue,
        )
        return status ? status.label : String(statusValue)
    }

    getStatusClass(statusValue: FeedbackStatus): string {
        const baseClasses = 'me-2 rounded-sm px-2.5 py-0.5 text-xs font-medium'

        switch (statusValue) {
            case FeedbackStatus.PENDING:
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case FeedbackStatus.INPROGRESS:
                return `${baseClasses} bg-blue-100 text-blue-800`
            case FeedbackStatus.COMPLETE:
                return `${baseClasses} bg-lime-100 text-lime-800`
            case FeedbackStatus.INCOMPLETE:
                return `${baseClasses} bg-red-100 text-red-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }
}
