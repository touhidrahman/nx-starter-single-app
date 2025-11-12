import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { FilestoreItem, FilestoreItemDto } from './filestore.model'

@Injectable({
    providedIn: 'root',
})
export class FilestoreApiService extends ApiService<
    FilestoreItem,
    FilestoreItemDto
> {
    constructor(
        protected override http: HttpClient,
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(http, `${env.apiUrl}/v1/storage`)
    }

    getAllProfilePics(filterOptions: {
        search: string
        groupId: string
        size: number
        page: number
        orderBy: any
    }): Observable<ApiResponse<FilestoreItem[]>> {
        let params = new HttpParams({})

        if (params) {
            if (filterOptions.search) {
                params = params.set('search', filterOptions.search)
            }
            if (filterOptions.groupId !== undefined) {
                params = params.set('groupId', filterOptions.groupId)
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

    uploadFile(
        file: File,
        entityId: string,
        entityName: string,
    ): Observable<ApiResponse<{ imageUrl: string }>> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('entityId', entityId)
        formData.append('entityName', entityName)
        return this.http.post<ApiResponse<{ imageUrl: string }>>(
            `${this.apiUrl}/upload-file`,
            formData,
        )
    }
}
