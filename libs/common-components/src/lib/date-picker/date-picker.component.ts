import { Component, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'lib-date-picker',
    imports: [PrimeModules, FormsModule],
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.scss',
})
export class DatePickerComponent {
    selectedDate = model<Date | null>(null)
    dateFormat = input<string>('dd-mm-yy')
    isReadonly = input<boolean>(true)
}
