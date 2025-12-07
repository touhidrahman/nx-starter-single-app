import { Injectable, inject } from '@angular/core'
import { OrderBy } from '@repo/common-models'
import { SimpleStore } from '@repo/store'
import {
    catchError,
    combineLatest,
    debounceTime,
    finalize,
    map,
    switchMap,
    tap,
    throwError,
} from 'rxjs'
import { User } from './user.model'
import { UserApiService } from './user-api.service'

export interface UserListState {
    loadedUsers: User[]
    users: User[]
    sortDirection: -1 | 1 | 0
    sortField: keyof User | ''
    searchTerm: string
    searchField: { [Key: string]: string } | null
    search: string
    loading: boolean
    error: boolean
    page: number
    size: number
    orderBy: OrderBy
    totalItems: number
    totalPages: number
}

export const initialUserListState: UserListState = {
    loadedUsers: [],
    users: [],
    sortDirection: 0,
    sortField: '',
    searchTerm: '',
    search: '',
    searchField: null,
    loading: true,
    error: false,
    page: 1,
    size: 20,
    orderBy: OrderBy.Desc,
    totalItems: 0,
    totalPages: 1,
}

@Injectable({
    providedIn: 'root',
})
export class UserListStateService extends SimpleStore<UserListState> {
    private userApiService = inject(UserApiService)

    constructor() {
        super(initialUserListState)
        this.init()
    }

    init() {
        this.loadUsers()
        this.continueFilteringUsers()
    }

    updateUserInState(user: User) {
        const users = this.getState().users
        const index = users.findIndex((u) => u.id === user.id)
        if (index === -1) return

        users[index] = user
        this.setState({ users: users })
    }

    // getUsersByRole(role: string) {
    //     return this.select('loadedUsers').pipe(
    //         map((users) => users.filter((u) => u.role === role)),
    //     )
    // }

    private loadUsers() {
        combineLatest([
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
            this.select('search'),
        ])
            .pipe(
                tap(() => this.setState({ loading: true })),
                switchMap(([page, size, orderBy, search]) => {
                    return this.userApiService.find({
                        page,
                        size,
                        orderBy,
                        search,
                    })
                }),
            )
            .subscribe({
                next: ({ data: users, pagination }) => {
                    this.setState({
                        users,
                        loadedUsers: users,
                        totalItems: pagination?.total ?? 0,
                        page: pagination?.page ?? 1,
                        size: pagination?.size ?? 10,
                        loading: false,
                    })
                },
                error: () => {
                    this.setState({ loading: false, error: true })
                },
            })
    }

    private continueFilteringUsers() {
        combineLatest([
            this.select('sortDirection'),
            this.select('sortField'),
            this.select('searchTerm'),
            this.select('searchField'),
            this.select('page'),
            this.select('size'),
        ])
            .pipe(
                debounceTime(300),
                tap(() => this.setState({ loading: true })),
                switchMap(([sortDirection, sortField, search, searchField, _page, _size]) => {
                    return this.select('loadedUsers').pipe(
                        map((data) => this.sortResults(data, sortField, sortDirection)),
                        map((data) => this.filterResults(data, searchField)),
                        map((data) => this.searchInResults(data, search)),
                    )
                }),
            )
            .subscribe({
                next: (users) => {
                    this.setState({ users: users, loading: false })
                },
            })
    }

    private sortResults(users: User[], sortField: keyof User | '', sortDirection: -1 | 0 | 1) {
        if (!sortField) return users

        return users.sort((a, b) => {
            const x = a[sortField]
            const y = b[sortField]
            if (sortField && x && y) {
                if (x < y) {
                    return -1 * sortDirection
                }
                if (x > y) {
                    return 1 * sortDirection
                }
            }
            return 0
        })
    }

    deleteUser(id: string) {
        this.setState({ loading: true })
        return this.userApiService.deleteUserById(id).pipe(
            tap(() => this.removeUser(id)),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete user'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    private removeUser(id: string) {
        const state = this.getState()
        const loadedUsers = state.loadedUsers.filter((user) => user.id !== id)
        const users = state.users.filter((user) => user.id !== id)

        this.setState({
            loadedUsers,
            users,
            totalItems: state.totalItems - 1,
        })
    }

    private filterResults(data: User[], searchField: { [Key: string]: string } | null) {
        if (!searchField || !Object.keys(data).length) return data

        return data.filter((obj) => {
            for (const key in searchField) {
                if (searchField[key] !== (obj as any)[key]) {
                    return false
                }
            }
            return true
        })
    }

    private searchInResults(data: User[], search: string) {
        if (!search) return data

        return data.filter((obj) => {
            for (const key in obj) {
                if ((obj as any)[key]?.toString().startsWith(search)) {
                    return true
                }
            }
            return false
        })
    }

    replaceUser(data: User) {
        this.setState({
            users: this.getState().users.map((user) => (user.id === data.id ? data : user)),
        })
    }
}
