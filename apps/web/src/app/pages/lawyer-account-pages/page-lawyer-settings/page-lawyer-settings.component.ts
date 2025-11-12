import { Component } from '@angular/core'

import { FormsModule } from '@angular/forms'
@Component({
    selector: 'app-page-lawyer-settings',
    imports: [FormsModule],
    templateUrl: './page-lawyer-settings.component.html',
    styleUrl: './page-lawyer-settings.component.scss',
})
export class PageLawyerSettingsComponent {
    togglebtnState = true
}
