import { Component, inject, OnInit } from '@angular/core'
import { AlertService } from '@repo/common-services'
import {
    NewsTicker,
    NewsTickerAddModalComponent,
    NewsTickerFilterComponent,
    NewsTickerFormDialogData,
    NewsTickersListStateService,
    NewsTickerTableComponent,
} from '@repo/news-ticker'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-news-ticker',
    imports: [PrimeModules, NewsTickerTableComponent, NewsTickerFilterComponent],
    templateUrl: './page-news-ticker.component.html',
    styleUrl: './page-news-ticker.component.scss',
    providers: [NewsTickersListStateService],
})
export class PageNewsTickerComponent implements OnInit {
    private dialogService = inject(DialogService)
    private alertService = inject(AlertService)
    newsTickerListStateService = inject(NewsTickersListStateService)

    ngOnInit(): void {
        this.newsTickerListStateService.init(0)
    }

    openNewsTickerModal(newsTicker: NewsTicker | null) {
        const isUpdate = newsTicker
        const header = isUpdate ? 'Edit News Ticker' : 'Add News Ticker'
        const data: NewsTickerFormDialogData = {
            newsTicker,
        }

        const ref = this.dialogService.open(NewsTickerAddModalComponent, {
            header,
            width: '50vw',
            dismissableMask: false,
            closable: true,
            data,
        })

        ref?.onClose.subscribe({
            next: (data) => {
                if (data) {
                    if (isUpdate !== null) {
                        this.newsTickerListStateService.replaceNewsTicker(data)
                    } else {
                        this.newsTickerListStateService.pushNewsTicker(data)
                    }
                }
            },
            error: (err) => {
                this.alertService.error(err.error.message)
            },
        })
    }

    onSearch(_value: Event) {
        // this.courtsListStateService.setState({
        //     search: (value.target as HTMLInputElement).value,
        // })
    }
}
