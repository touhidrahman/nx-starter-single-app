import { Injectable, inject } from '@angular/core'
import { SimpleStore } from '@repo/store'
import { catchError, combineLatest, debounceTime, finalize, switchMap, tap, throwError } from 'rxjs'
import { Action, AuditLog } from './audit-log.model'
import { AuditLogApiService } from './audit-log-api.service'

export type AuditLogsState = {
    loading: boolean
    auditLogs: AuditLog[]
    search: string
    entityId: string
    creatorId: string
    orderBy: 'desc' | 'asc'
    action: Action | null
    page: number
    size: number
    total: number
    error: boolean
}

const initialState: AuditLogsState = {
    loading: false,
    auditLogs: [],
    search: '',
    page: 1,
    size: 20,
    orderBy: 'desc',
    total: 0,
    entityId: '',
    creatorId: '',
    action: null,
    error: false,
}

@Injectable()
export class AuditLogStateService extends SimpleStore<AuditLogsState> {
    private auditLogApiService = inject(AuditLogApiService)

    constructor() {
        super(initialState)
    }

    init() {
        this.continueLoadingAuditLogs()
    }

    continueLoadingAuditLogs() {
        combineLatest([
            this.select('search'),
            this.select('entityId'),
            this.select('creatorId'),
            this.select('action'),
            this.select('page'),
            this.select('size'),
            this.select('orderBy'),
        ])
            .pipe(
                debounceTime(300),
                tap(() => this.setState({ loading: true })),
                switchMap(([search, entityId, creatorId, action, page, size, orderBy]) => {
                    return this.auditLogApiService.getAllAuditLogs({
                        search,
                        entityId,
                        creatorId,
                        action,
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
                        auditLogs: data,
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

    deleteAuditLog(id: string) {
        this.setState({ loading: true })
        return this.auditLogApiService.delete(id).pipe(
            tap((_res) => this.removeAuditLogFromState(id)),
            catchError((_err) => {
                this.setState({ error: true })
                return throwError(() => new Error('Failed to delete audit log'))
            }),
            finalize(() => this.setState({ loading: false })),
        )
    }

    private removeAuditLogFromState(id: string) {
        const updatedAuditLogs = this.getState().auditLogs.filter((logs) => logs.id !== id)
        this.setState({ auditLogs: updatedAuditLogs })
    }
}
