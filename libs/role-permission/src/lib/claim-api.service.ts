import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { APP_ENVIRONMENT } from '@repo/core'
import { Observable } from 'rxjs'
import { Claim } from './claim.model'

@Injectable({
    providedIn: 'root',
})
export class ClaimApiService {
    private env = inject(APP_ENVIRONMENT)
    private http = inject(HttpClient)
    private resourceUrl = `${this.env.apiUrl}/v1/claims`

    getAll(groupId?: string): Observable<ApiResponse<Claim[]>> {
        let params = new HttpParams()
        if (groupId) {
            params = params.set('groupId', groupId)
        }
        return this.http.get<ApiResponse<Claim[]>>(`${this.resourceUrl}`, {
            params,
        })
    }
}
