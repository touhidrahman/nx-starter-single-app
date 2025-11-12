import { Component, computed, input } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'
import { LoaderComponent } from '../loader/loader.component'
import { NoDataComponent } from '../no-data-component/no-data.component'

@Component({
    selector: 'lib-app-error-wrapper',
    imports: [PrimeModules, LoaderComponent, NoDataComponent],
    templateUrl: './error-wrapper.component.html',
    styleUrl: './error-wrapper.component.css',
})
export class ErrorWarperComponent {
    isLoading = input(false)
    isError = input(false)
    errorMessage = input('Data fetching failed')
    loadingMessage = input('Fetching data')
    noDataMessage = input('No data found')

    // Accept raw data input (can be array, null, or undefined)
    data = input<unknown[] | null | undefined>(null)

    // Computed signal for hasData
    hasData = computed(() => {
        const data = this.data()
        return !!data && Array.isArray(data) && data.length > 0
    })
}
