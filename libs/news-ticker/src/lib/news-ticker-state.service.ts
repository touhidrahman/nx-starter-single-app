import { Injectable, inject } from '@angular/core'
import { SimpleStore } from '@repo/store'
import {
    catchError,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    finalize,
    switchMap,
    tap,
    throwError,
    timer,
} from 'rxjs'
import { NewsTicker } from './news-ticker.model'
import { NewsTickerApiService } from './news-ticker-api.service'

interface NewsTickerListState {
    newsTickers: NewsTicker[]
    loading: boolean
    error: boolean
    search: string
    status: boolean | undefined
}

const initialState: NewsTickerListState = {
    newsTickers: [],
    loading: false,
    error: false,
    search: '',
    status: undefined,
}

@Injectable()
export class NewsTickersListStateService extends SimpleStore<NewsTickerListState> {
    private newsTickerApiService = inject(NewsTickerApiService)
    private initialized = false

    constructor() {
        super(initialState)
    }

    init(delayMs: number) {
        if (this.initialized) return
        timer(delayMs).subscribe({
            next: () => this.continueLoadingNewsTickers(),
        })
        this.initialized = true
    }

    replaceNewsTicker(data: NewsTicker) {
        const { newsTickers } = this.getState()
        this.setState({
            newsTickers: newsTickers.map((c) => (c.id === data.id ? data : c)),
        })
    }

    updateNewsTicker(id: string, data: NewsTicker) {
        const { newsTickers } = this.getState()
        this.setState({ loading: true })

        return this.newsTickerApiService.update(id, data).pipe(
            tap((value) => {
                if (value.data) {
                    this.updateNewsTickerState(id, value.data, newsTickers)
                }
            }),
            catchError(() => {
                this.setState({ error: true })
                return throwError(
                    () => new Error('Failed to update news ticker'),
                )
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    deleteNewsTicker(id: string) {
        this.setState({ loading: true })

        return this.newsTickerApiService.delete(id).pipe(
            tap(() => this.removeNewsTickerFromState(id)),
            catchError(() => {
                this.setState({ error: true })
                return throwError(
                    () => new Error('Failed to delete news ticker'),
                )
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    pushNewsTicker(newsTicker: NewsTicker) {
        this.setState({
            newsTickers: [...this.getState().newsTickers, newsTicker],
        })
    }

    private continueLoadingNewsTickers() {
        combineLatest([this.select('search'), this.select('status')])
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, status]) => {
                    return this.newsTickerApiService.find({
                        search,
                        status,
                    })
                }),
            )
            .subscribe({
                next: ({ data }) => {
                    this.setState({
                        loading: false,
                        newsTickers: data,
                    })
                },
                error: () => {
                    this.setState({ loading: false, error: true })
                },
            })
    }

    private removeNewsTickerFromState(id: string) {
        const updatedNewsTickers = this.getState().newsTickers.filter(
            (newsTicker) => newsTicker.id !== id,
        )
        this.setState({ newsTickers: updatedNewsTickers })
    }

    private updateNewsTickerState(
        id: string,
        updatedTicker: NewsTicker,
        currentTickers: NewsTicker[],
    ) {
        this.setState({
            newsTickers: [
                ...currentTickers.filter((c) => c.id !== id),
                updatedTicker,
            ],
        })
    }
}
