import { CommonModule } from '@angular/common'
import { Component, inject, output } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { NewsTicker } from '../news-ticker.model'
import { NewsTickersListStateService } from '../news-ticker-state.service'

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-news-ticker-table',
    imports: [CommonModule, PrimeModules, NoDataComponent],
    templateUrl: './news-ticker-table.component.html',
    styleUrl: './news-ticker-table.component.scss',
})
export class NewsTickerTableComponent {
    private alertService = inject(AlertService)
    newsTickerListStateService = inject(NewsTickersListStateService)

    edit = output<NewsTicker>()

    onDeleteNewsTicker(id: string) {
        this.newsTickerListStateService.deleteNewsTicker(id).subscribe({
            next: () => {
                this.alertService.success('newsTicker deleted successfully')
            },
            error: () => {
                this.alertService.error('newsTicker delete failed')
            },
        })
    }

    confirmDelete(newsTicker: NewsTicker) {
        const confirmDialogData: ConfirmDialogData = {
            title: 'Delete News Ticker',
            message: `Are you sure you want to delete ${newsTicker.id}?`,
            confirmAction: () => this.onDeleteNewsTicker(newsTicker.id),
        }
        this.alertService.confirm(confirmDialogData)
    }

    onEditNewsTicker(newsTicker: NewsTicker) {
        this.edit.emit(newsTicker)
    }
}
