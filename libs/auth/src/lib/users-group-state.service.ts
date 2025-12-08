import { Injectable, inject } from '@angular/core'
import { Group } from '@repo/common-auth'
import { GroupApiService } from '@repo/group'
import { SimpleStore } from '@repo/store'
import { catchError, finalize, tap, throwError, timer } from 'rxjs'

export type UserGroupState = {
    groups: Group[]
    loading: boolean
    error: boolean
    hasVendorGroup: boolean
    hasClientGroup: boolean
}

const initialState: UserGroupState = {
    groups: [],
    loading: false,
    error: false,
    hasVendorGroup: false,
    hasClientGroup: false,
}

@Injectable({
    providedIn: 'root',
})
export class UserGroupsStateService extends SimpleStore<UserGroupState> {
    private groupApiService = inject(GroupApiService)
    private initialized = false

    constructor() {
        super(initialState)
    }

    init(delayMs: number) {
        if (this.initialized) return
        timer(delayMs).subscribe({ next: () => this.continueLoadingGroups() })
        this.initialized = true
    }

    loadMyGroups() {
        this.setState({ loading: true })
        return this.groupApiService.getMyGroups().pipe(
            tap(({ data }) => {
                this.setState({
                    groups: data.groups,
                    hasVendorGroup: data.hasVendorGroup,
                    hasClientGroup: data.hasClientGroup,
                    loading: false,
                    error: false,
                })
            }),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to load groups'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    private continueLoadingGroups() {
        this.loadMyGroups().subscribe({
            next: (res: any) => {
                this.setState({
                    groups: res.data.groups,
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
}
