import { Injectable, inject } from '@angular/core'
import { SimpleStore } from '@repo/store'
import { combineLatest, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs'
import { FilestoreItem } from './filestore.model'
import { FilestoreApiService } from './filestore-api.service'

interface StorageListState {
    storages: FilestoreItem[]
    profilePhotoUrl: string
    loading: boolean
    error: boolean
    search: string
    groupId: string
    orderBy: 'asc' | 'desc'
    page: number
    size: number
    totalItems: number
    totalPages: number
}

const initialState: StorageListState = {
    storages: [],
    profilePhotoUrl: '',
    loading: false,
    error: false,
    search: '',
    groupId: '',
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    orderBy: 'desc',
}

@Injectable()
export class StorageStateService extends SimpleStore<StorageListState> {
    filestoreApiService = inject(FilestoreApiService)

    constructor() {
        super(initialState)
    }

    init() {
        this.continueLoadingStorage()
    }

    private continueLoadingStorage() {
        combineLatest([
            this.select('search'),
            this.select('groupId'),
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
        ])
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, groupId, page, size, orderBy]) => {
                    return this.filestoreApiService.find({
                        search,
                        groupId,
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
                        storages: data,
                        totalItems: pagination?.total ?? 0,
                        totalPages: Math.ceil((pagination?.total ?? 0) / (pagination?.size ?? 1)),
                    })
                },
                error: (_err) => {
                    this.setState({ loading: false, error: true })
                },
            })
    }
}
