import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { NewsTicker, NewsTickerFormDialogData } from '../news-ticker.model'
import { NewsTickerApiService } from '../news-ticker-api.service'
import { NewsTickerFormService } from '../news-ticker-form.service'

@Component({
    selector: 'lib-news-ticker-add-modal',
    imports: [ReactiveFormsModule, PrimeModules],
    templateUrl: './news-ticker-add-modal.component.html',
    styleUrl: './news-ticker-add-modal.component.scss',
    providers: [NewsTickerFormService],
})
export class NewsTickerAddModalComponent implements OnInit {
    private newsTickerApiService = inject(NewsTickerApiService)
    private alertService = inject(AlertService)
    private ref = inject(DynamicDialogRef)

    config =
        inject<DynamicDialogConfig<NewsTickerFormDialogData>>(
            DynamicDialogConfig,
        )

    newsTickerFormService = inject(NewsTickerFormService)

    isLoading = signal(false)
    isEdit = signal(false)

    ngOnInit(): void {
        this.getNewsTickerData()
    }

    getNewsTickerData() {
        const newsTickerData = this.config?.data?.newsTicker
        if (newsTickerData) {
            this.isEdit.set(true)
            this.newsTickerFormService.patchForm(newsTickerData)
        }
    }

    onSubmit(event: Event) {
        this.isLoading.set(true)
        event?.preventDefault()
        const formValue = this.newsTickerFormService.getValue()
        const newsTicker: NewsTicker = {
            ...formValue,
        }

        if (this.isEdit() && this.config.data?.newsTicker) {
            this.update(this.config.data.newsTicker.id, newsTicker)
        } else {
            this.create(newsTicker)
        }
    }

    private create(newsTicker: NewsTicker) {
        this.newsTickerApiService.create(newsTicker).subscribe({
            next: (res: ApiResponse<NewsTicker>) => {
                this.ref?.close(res.data)
                this.newsTickerFormService.form.reset()
                this.isLoading.set(false)
                this.alertService.success('newsTicker added successfully')
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('newsTicker add failed')
            },
        })
    }

    private update(id: string, newsTicker: NewsTicker) {
        this.newsTickerApiService.update(id, newsTicker).subscribe({
            next: (res: ApiResponse<NewsTicker>) => {
                if (res.data) {
                    this.ref?.close(res.data)
                    this.isLoading.set(false)
                    this.alertService.success('newsTicker updated successfully')
                }
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('newsTicker update failed')
            },
        })
    }
}
