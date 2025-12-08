import { Injectable, inject, signal } from '@angular/core'
import { Group } from '@repo/common-auth'
import { GroupApiService } from '@repo/group'
import { SimpleStore } from '@repo/store'
import { catchError, debounceTime, finalize, of, switchMap, tap, throwError } from 'rxjs'

export type GroupState = {
    group: Group | null
    loading: boolean
    error: boolean
    status: string | undefined
    groupId: string | null
}

const initialGroupState: GroupState = {
    group: null,
    loading: false,
    error: false,
    status: undefined,
    groupId: null,
}

@Injectable()
export class GroupStateService extends SimpleStore<GroupState> {
    private initialized = signal(false)
    private groupApiService = inject(GroupApiService)

    constructor() {
        super(initialGroupState)
    }

    init() {
        if (this.initialized()) return
        this.continueLoadingGroup()
        this.initialized.set(true)
    }

    private continueLoadingGroup() {
        this.select('groupId')
            .pipe(
                debounceTime(200),
                tap(() => this.setState({ loading: true })),
                switchMap((groupId) => {
                    if (!groupId) return of(null)
                    return this.groupApiService.findById(groupId)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.setState({
                        group: res ? res.data : null,
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

    deleteGroup(id: string) {
        this.setState({ loading: true })
        return this.groupApiService.delete(id).pipe(
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete group'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }
}
