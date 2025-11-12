import { Component, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'lib-search',
    imports: [PrimeModules, FormsModule],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
})
export class SearchComponent {
    isFilter = input<boolean>(false)
    isFilterChange = output<boolean>()
    search = output<string>()
    isActiveFilter = input<boolean>(false)
    searchText = signal<string>('')

    onSearch() {
        this.search.emit(this.searchText())
    }

    clearSearch() {
        this.searchText.set('')
        this.onSearch()
    }

    onToggleFilter() {
        const newFilterState = !this.isFilter()
        this.isFilterChange.emit(newFilterState)
    }
}
