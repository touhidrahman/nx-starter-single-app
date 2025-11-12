import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'

import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { UserSettings, UserSettingsDto } from './user-setting.model.service'

@Injectable({
    providedIn: 'root',
})
export class UserSettingsApiService extends ApiService<
    UserSettingsDto,
    UserSettings
> {
    constructor(
        protected override http: HttpClient,
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(http, `${env.apiUrl}/v1/user-setting`)
    }

    getUsersSettingsByUserId(): Observable<ApiResponse<UserSettings>> {
        return this.http.get<ApiResponse<UserSettings>>(`${this.apiUrl}`)
    }

    updateUserSetting(
        userId: string,
        data: UserSettingsDto,
    ): Observable<ApiResponse<UserSettingsDto>> {
        return this.http.put<ApiResponse<UserSettingsDto>>(
            `${this.apiUrl}/${userId}`,
            data,
        )
    }
}
