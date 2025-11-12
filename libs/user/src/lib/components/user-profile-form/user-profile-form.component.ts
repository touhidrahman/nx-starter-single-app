import { Component, input, model, output } from '@angular/core'

import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-user-profile-form',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './user-profile-form.component.html',
    styleUrl: './user-profile-form.component.scss',
})
export class UserProfileFormComponent {
    form = input.required<FormGroup>()
    isEditable = model(false)
    isLoading = input(false)

    edit = output<boolean>()
    save = output<Event>()
}
