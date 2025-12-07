import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { GroupType } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { Role, RoleDto } from './role.model'

@Injectable({
    providedIn: 'root',
})
export class RoleApiService extends ApiService<Role, RoleDto> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/roles`)
    }

    override find(params: { groupId: string }): Observable<ApiResponse<Role[]>> {
        return super.find(params)
    }
}
