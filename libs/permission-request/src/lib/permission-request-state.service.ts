import { Injectable, inject } from '@angular/core'
import { SimpleStore } from '@repo/store'
import { catchError, finalize, tap, throwError, timer } from 'rxjs'
import { PermissionRequest } from './permission-request.model'
import { PermissionRequestApiService } from './permission-request-api.service'

interface permissionRequestListState {
    permissionRequests: PermissionRequest[]
    loading: boolean
    error: boolean
    totalUnreadRequests: number
}

const initialState: permissionRequestListState = {
    permissionRequests: [],
    loading: false,
    error: false,
    totalUnreadRequests: 0,
}

@Injectable({ providedIn: 'root' })
export class PermissionRequestsListStateService extends SimpleStore<permissionRequestListState> {
    private permissionRequestApiService = inject(PermissionRequestApiService)
    private initialized = false

    constructor() {
        super(initialState)
        this.init(5000)
    }

    init(delayMs: number) {
        if (this.initialized) return
        timer(delayMs).subscribe({
            next: () => this.continueLoadingPermissionRequests(),
        })
        this.initialized = true
    }

    replacePermissionRequest(data: PermissionRequest) {
        const { permissionRequests } = this.getState()
        this.setState({
            permissionRequests: permissionRequests.map((c) => (c.id === data.id ? data : c)),
        })
    }

    updatePermissionRequest(id: string, data: PermissionRequest) {
        const { permissionRequests } = this.getState()
        this.setState({ loading: true })

        return this.permissionRequestApiService.update(id, data).pipe(
            tap((value) => {
                if (value.data) {
                    this.updatePermissionRequestState(id, value.data, permissionRequests)
                }
            }),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to update news ticker'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    readPermissionRequest(id: string) {
        this.setState({ loading: true })

        return this.permissionRequestApiService.readPermissionRequest(id).pipe(
            tap((value) => {
                if (value.data) {
                    this.removePermissionRequestFromState(value.data.id)
                    this.updateTotalUnreadRequests()
                }
            }),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to read news ticker'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    approvePermissionRequest(id: string) {
        this.setState({ loading: true })

        return this.permissionRequestApiService.approvePermissionRequest(id).pipe(
            tap((value) => {
                if (value.data) {
                    this.removePermissionRequestFromState(value.data.id)
                    this.updateTotalUnreadRequests()
                }
            }),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to approve news ticker'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    deletePermissionRequest(id: string) {
        this.setState({ loading: true })

        return this.permissionRequestApiService.delete(id).pipe(
            tap(() => this.removePermissionRequestFromState(id)),
            catchError(() => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete news ticker'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    pushPermissionRequest(permissionRequest: PermissionRequest) {
        this.setState({
            permissionRequests: [...this.getState().permissionRequests, permissionRequest],
        })
    }

    private continueLoadingPermissionRequests() {
        this.permissionRequestApiService.find({ isRead: false, isApproved: false }).subscribe({
            next: ({ data }) => {
                this.setState({
                    loading: false,
                    permissionRequests: data,
                    totalUnreadRequests: data.length,
                })
            },
            error: () => {
                this.setState({ loading: false, error: true })
            },
        })
    }

    private removePermissionRequestFromState(id: string) {
        const updatedPermissionRequests = this.getState().permissionRequests.filter(
            (permissionRequest) => permissionRequest.id !== id,
        )
        this.setState({ permissionRequests: updatedPermissionRequests })
    }

    private updatePermissionRequestState(
        id: string,
        updatedPermission: PermissionRequest,
        currentPermissions: PermissionRequest[],
    ) {
        this.setState({
            permissionRequests: [
                ...currentPermissions.filter((c) => c.id !== id),
                updatedPermission,
            ],
        })
    }

    private updateTotalUnreadRequests() {
        const total = this.getState().totalUnreadRequests
        this.setState({ totalUnreadRequests: total - 1 })
    }
}
