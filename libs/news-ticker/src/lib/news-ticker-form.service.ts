import { Injectable, inject } from '@angular/core'
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { NewsTicker } from './news-ticker.model'

@Injectable()
export class NewsTickerFormService {
    private fb = inject(NonNullableFormBuilder)
    form = this.buildForm()

    buildForm(): FormGroup {
        const { required } = Validators
        return this.fb.group({
            title: ['', [required]],
            tickerUrl: [''],
            isActive: [true],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: NewsTicker) {
        this.form.patchValue(data)
    }
}
