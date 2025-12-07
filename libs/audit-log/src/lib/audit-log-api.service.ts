import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { Action, AuditLog, AuditLogDto } from './audit-log.model'

@Injectable({
    providedIn: 'root',
})
export class AuditLogApiService extends ApiService<AuditLog, AuditLogDto> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/logs`)
    }

    getAllAuditLogs(filterOptions: {
        search: string
        creatorId: string
        entityId: string
        action: Action | null
        size: number
        orderBy: string
        page: number
    }): Observable<ApiResponse<AuditLog[]>> {
        let params = new HttpParams({})

        if (params) {
            if (filterOptions.search) {
                params = params.set('search', filterOptions.search)
            }
            if (filterOptions.creatorId) {
                params = params.set('creatorId', filterOptions.creatorId)
            }
            if (filterOptions.action !== null) {
                params = params.set('action', filterOptions.action.name.toString())
            }
            if (filterOptions.entityId) {
                params = params.set('entityId', filterOptions.entityId)
            }
            if (filterOptions.page !== undefined) {
                params = params.set('page', filterOptions.page)
            }
            if (filterOptions.size !== undefined) {
                params = params.set('size', filterOptions.size)
            }
            if (filterOptions.orderBy !== undefined) {
                params = params.set('orderBy', filterOptions.orderBy)
            }
        }
        return this.find(params)
    }
}
