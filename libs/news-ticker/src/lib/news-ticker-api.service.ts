import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable, inject } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { ApiService } from '@repo/common-services'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'
import { Observable } from 'rxjs'
import { NewsTicker, NewsTickerDto } from './news-ticker.model'

@Injectable({ providedIn: 'root' })
export class NewsTickerApiService extends ApiService<NewsTicker, NewsTickerDto> {
    constructor(
        // eslint-disable-next-line @angular-eslint/prefer-inject
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        super(inject(HttpClient), `${env.apiUrl}/v1/news-tickers`)
    }

    override find(
        query: { search?: string; status?: boolean } = {},
    ): Observable<ApiResponse<NewsTicker[]>> {
        let params = new HttpParams()
        if (query.search) {
            params = params.set('search', query.search)
        }
        if (query.status) {
            params = params.set('status', query.status)
        }
        return super.find(params)
    }
}
