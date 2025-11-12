import { Component, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'
import { FilterOption } from '../common.model'

@Component({
    selector: 'lib-item-selector',
    imports: [PrimeModules, FormsModule],
    templateUrl: './item-selector.component.html',
    styleUrl: './item-selector.component.scss',
})
export class ItemSelectorComponent {
    filterName = model<string>('')
    filterOption = input<FilterOption[] | []>([])
    filteredOn = input<string>('label')
    placeholder = input<string>('Select an option')
}
