import { Injectable, inject } from '@angular/core'
import { OrderBy } from '@repo/common-models'
import { AuthStateService } from '@repo/auth'
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
} from 'rxjs'
import { Invitation } from './invitation.model'
import { InvitationApiService } from './invitation-api.service'

export interface InvitationListState {
    invitations: Invitation[]
    loading: boolean
    error: boolean
    orderBy: OrderBy
    groupId: string
    page: number
    size: number
    search: string
    totalItems: number
    totalPages: number
}

const initialState: InvitationListState = {
    invitations: [],
    loading: true,
    error: false,
    orderBy: OrderBy.Asc,
    groupId: '',
    page: 1,
    size: 20,
    search: '',
    totalItems: 0,
    totalPages: 1,
}

@Injectable()
export class InvitationStateService extends SimpleStore<InvitationListState> {
    private invitationApiService = inject(InvitationApiService)
    private authService = inject(AuthStateService)

    constructor() {
        super(initialState)
    }

    init() {
        const groupId = this.authService.getGroupId()
        if (groupId) {
            this.setState({ groupId })
        }

        this.continueLoadingInvitations()
    }

    private continueLoadingInvitations() {
        combineLatest([
            this.select('search'),
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
            this.select('groupId'),
        ])
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, page, size, orderBy, groupId]) => {
                    return this.invitationApiService.find({
                        search,
                        page,
                        size,
                        orderBy,
                        groupId,
                    })
                }),
                catchError((err) => {
                    this.setState({ loading: false, error: true })
                    return throwError(() => new Error(err.error.message))
                }),
            )
            .subscribe({
                next: ({ data, pagination }) => {
                    this.setState({
                        loading: false,
                        invitations: data,
                        totalItems: pagination?.total ?? 0,
                        page: pagination?.page ?? 1,
                        size: pagination?.size ?? 10,
                    })
                },
                error: (_err) => {
                    this.setState({ loading: false })
                },
            })
    }

    deleteInvitation(id: string) {
        this.setState({ loading: true })
        return this.invitationApiService.delete(id).pipe(
            tap(() => {
                this.setState({
                    loading: false,
                    invitations: this.getState().invitations.filter((i) => i.id !== id),
                })
            }),
            catchError((err) => {
                this.setState({
                    loading: false,
                    error: true,
                })
                return throwError(() => new Error(err.error.message))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }
}
