import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { Backup } from './backup.model'

@Injectable({ providedIn: 'root' })
export class BackupApiService {
    private env = inject<AppEnvironmentConfig>(APP_ENVIRONMENT)
    private http = inject(HttpClient)
    private apiUrl = `${this.env.apiUrl}/v1/database-backup`

    find(): Observable<ApiResponse<Backup[]>> {
        return this.http.get<ApiResponse<Backup[]>>(this.apiUrl)
    }

    downloadBackup(fileName: string) {
        return this.http.get(`${this.apiUrl}/${fileName}/download`, {
            responseType: 'blob',
        })
    }
}
