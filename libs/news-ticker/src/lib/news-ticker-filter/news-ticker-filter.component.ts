import { CommonModule } from '@angular/common'
import { Component, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { LabelValuePair } from '@repo/common-models'
import { PrimeModules } from '@repo/prime-modules'
import { NewsTickersListStateService } from '../news-ticker-state.service'

@Component({
    selector: 'lib-news-ticker-filter',
    imports: [CommonModule, PrimeModules, FormsModule],
    templateUrl: './news-ticker-filter.component.html',
    styleUrl: './news-ticker-filter.component.css',
})
export class NewsTickerFilterComponent implements OnInit {
    newsTickerStateService = inject(NewsTickersListStateService)
    elementRef = inject(ElementRef)

    showFilter = signal(false)

    // Filter properties
    selectedStatus: boolean | null = null

    // Options for dropdown
    statusOptions: LabelValuePair<boolean>[] = [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false },
    ]

    ngOnInit() {
        const currentState = this.newsTickerStateService.getState()
        this.selectedStatus = currentState.status ?? null
    }

    closeFilter() {
        this.showFilter.set(false)
    }

    applyFilters() {
        this.newsTickerStateService.setState({
            status: this.selectedStatus !== null ? this.selectedStatus : undefined,
        })
        this.closeFilter()
    }

    resetFilter() {
        this.selectedStatus = null
        this.newsTickerStateService.setState({
            status: undefined,
        })
    }

    @HostListener('document:click', ['$event'])
    onOutsideClick(event: MouseEvent) {
        const clickedInside = this.elementRef.nativeElement.contains(event.target)
        if (!clickedInside) {
            this.closeFilter()
        }
    }
}
