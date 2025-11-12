import { Injectable, inject, signal } from '@angular/core'
import { Group } from '@repo/common-auth'
import { OrderBy } from '@repo/common-models'
import { GroupApiService } from '@repo/group'
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

export type GroupListState = {
    groups: Group[]
    selectedGroup: Group | null
    loading: boolean
    error: boolean
    orderBy: OrderBy
    page: number
    size: number
    search: string
    total: number
    totalPages: number
    type: string | undefined
    status: string | undefined
    selectedGroupId: string
}

const initialGroupListState: GroupListState = {
    groups: [],
    selectedGroup: null,
    loading: false,
    error: false,
    orderBy: OrderBy.Desc,
    page: 1,
    size: 20,
    search: '',
    total: 0,
    type: undefined,
    status: undefined,
    totalPages: 1,
    selectedGroupId: '',
}

@Injectable({
    providedIn: 'root',
})
export class GroupListStateService extends SimpleStore<GroupListState> {
    private groupApiService = inject(GroupApiService)
    private initialized = signal(false)

    constructor() {
        super(initialGroupListState)
    }

    init() {
        if (this.initialized()) return

        this.continueLoadingGroup()
        this.continueLoadingGroupById()

        this.initialized.set(true)
    }

    pushGroup(group: Group) {
        this.setState({
            groups: [...this.getState().groups, group],
        })
    }

    replaceGroup(group: Group) {
        this.setState({
            groups: this.getState().groups.map((g) =>
                g.id === group.id ? group : g,
            ),
        })
    }

    private continueLoadingGroup() {
        combineLatest([
            this.select('search'),
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
            this.select('status'),
            this.select('type'),
        ])
            .pipe(
                debounceTime(200),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, page, size, orderBy, status, type]) => {
                    return this.groupApiService.find({
                        search,
                        page,
                        size,
                        orderBy,
                        status,
                        type,
                    })
                }),
            )
            .subscribe({
                next: ({ data, pagination }) => {
                    this.setState({
                        groups: data,
                        loading: false,
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? 1,
                        size: pagination?.size ?? 10,
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

    deleteGroup(id: string) {
        this.setState({ loading: true })
        return this.groupApiService.delete(id).pipe(
            tap(() => this.removeGroup(id)),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete group'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    private continueLoadingGroupById() {
        combineLatest([this.select('selectedGroupId')])
            .pipe(
                debounceTime(200),
                tap(() => this.setState({ loading: true })),
                switchMap(([id]) => {
                    return this.groupApiService.findById(id)
                }),
            )
            .subscribe({
                next: ({ data }) => {
                    this.setState({
                        selectedGroup: data,
                        loading: false,
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

    updateGroupInState(updatedGroup: Group) {
        this.setState({
            selectedGroup: updatedGroup,
        })
    }

    private removeGroup(id: string) {
        const updateGroup = this.getState().groups.filter(
            (group) => group.id !== id,
        )
        this.setState({ groups: updateGroup, selectedGroup: null })
    }
}
