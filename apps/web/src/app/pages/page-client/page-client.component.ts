import { Component } from '@angular/core'

import { FormsModule } from '@angular/forms'
@Component({
    selector: 'app-page-client',
    imports: [FormsModule],
    templateUrl: './page-client.component.html',
    styleUrl: './page-client.component.scss',
})
export class PageClientComponent {
    value!: number
}
