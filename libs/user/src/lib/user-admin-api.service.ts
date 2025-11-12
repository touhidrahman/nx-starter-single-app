import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { ApiResponse, OrderBy } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { AdminUser, User, UserDto } from './user.model'

@Injectable({
    providedIn: 'root',
})
export class UserAdminApiService extends ApiService<User, UserDto> {
    constructor(
        protected override http: HttpClient,
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(http, `${env.apiUrl}/v1/admins`)
    }
    getAllAdmins(filterOptions: {
        search?: string
        size?: number
        page?: number
        orderBy?: OrderBy
    }): Observable<ApiResponse<User[]>> {
        let params = new HttpParams({})

        if (params) {
            if (filterOptions.search) {
                params = params.set('search', filterOptions.search)
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

    updateAdmin(
        id: string,
        updateData: Partial<AdminUser>,
    ): Observable<ApiResponse<AdminUser>> {
        return this.http.put<ApiResponse<AdminUser>>(
            `${this.env.apiUrl}/v1/admins/${id}`,
            updateData,
        )
    }
}
