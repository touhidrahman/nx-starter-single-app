import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse, OrderBy } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { catchError, map, Observable, of, throwError } from 'rxjs'
import { Invitation, InvitationDto } from './invitation.model'

@Injectable({
    providedIn: 'root',
})
export class InvitationApiService extends ApiService<Invitation, InvitationDto> {
    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/invites`)
    }

    acceptInvite(token: string): Observable<ApiResponse<{ redirect: boolean; url: string }>> {
        return this.http
            .post<ApiResponse<{ redirect: boolean; url: string }>>(
                `${this.apiUrl}/accept`,
                { token },
                {
                    observe: 'response',
                    responseType: 'json',
                },
            )
            .pipe(
                map((response: HttpResponse<ApiResponse<{ redirect: boolean; url: string }>>) => {
                    if (response.status === 302 || response.ok) {
                        return response.body!
                    }
                    throw new Error('Unexpected response status')
                }),
                catchError((error: HttpErrorResponse) => {
                    if (error.error) {
                        return of(
                            error.error as ApiResponse<{
                                redirect: boolean
                                url: string
                            }>,
                        )
                    }
                    return throwError(() => error)
                }),
            )
    }

    getAllInvitation(filterOptions: {
        search: string
        size: number
        page: number
        orderBy: OrderBy
    }): Observable<ApiResponse<Invitation[]>> {
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
}
