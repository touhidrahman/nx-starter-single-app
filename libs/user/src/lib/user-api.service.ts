import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { Params } from '@angular/router'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { User, UserDto } from './user.model'

@Injectable({
    providedIn: 'root',
})
export class UserApiService extends ApiService<User, UserDto> {
    constructor(
        protected override http: HttpClient,
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(http, `${env.apiUrl}/v1/users`)
    }

    getUsers(params: Params = {}): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(this.apiUrl, {
            params,
        })
    }

    getUnapprovedUsers(organizationId: string): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(this.apiUrl, {
            params: { organizationId, isApproved: false },
        })
    }

    changeRole(id: string, roleId: string): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}/role`, {
            id: roleId,
        })
    }

    getUsersByGroupId(id: string): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/group-user/${id}`)
    }

    getUserById(id: string): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`)
    }

    deleteUserById(id: string): Observable<ApiResponse<User>> {
        return this.http.delete<ApiResponse<User>>(`${this.apiUrl}/${id}`)
    }

    updateUserStatus(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.env.apiUrl}/v1/user/${id}`, data)
    }
}
