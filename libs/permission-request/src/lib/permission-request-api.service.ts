import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { PermissionRequest, PermissionRequestDto } from './permission-request.model'

@Injectable({ providedIn: 'root' })
export class PermissionRequestApiService extends ApiService<
    PermissionRequest,
    PermissionRequestDto
> {
    constructor(
        // eslint-disable-next-line @angular-eslint/prefer-inject
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/permission-requests`)
    }

    readPermissionRequest(id: string): Observable<ApiResponse<PermissionRequest>> {
        return this.http.put<ApiResponse<PermissionRequest>>(`${this.apiUrl}/read/${id}`, {})
    }

    approvePermissionRequest(id: string): Observable<ApiResponse<PermissionRequest>> {
        return this.http.put<ApiResponse<PermissionRequest>>(`${this.apiUrl}/approve/${id}`, {})
    }
}
