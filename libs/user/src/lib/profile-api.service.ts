import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { UpdateUser, User } from './user.model'

@Injectable({
    providedIn: 'root',
})
export class ProfileApiService {
    private readonly apiUrl: string = ''
    private baseUrl = ''

    constructor(
        private http: HttpClient,
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        this.apiUrl = `${env.apiUrl}/v1/user/profile`
        this.baseUrl = `${env.apiUrl}`
    }

    uploadProfilePic(file: File) {
        const formData = new FormData()
        formData.append('file', file)
        return this.http.post<ApiResponse<User>>(`${this.apiUrl}/upload-profile-picture`, formData)
    }

    deleteProfilePic(): Observable<ApiResponse<User>> {
        return this.http.delete<ApiResponse<User>>(`${this.apiUrl}/image`)
    }

    updateProfile(body: Partial<UpdateUser>): Observable<ApiResponse<User>> {
        return this.http.patch<ApiResponse<User>>(`${this.apiUrl}`, body)
    }
}
