import { Component } from '@angular/core'

import { NewPasswordComponent } from '@repo/auth'

@Component({
    selector: 'app-page-set-new-password',
    imports: [NewPasswordComponent],
    templateUrl: './page-set-new-password.component.html',
    styleUrl: './page-set-new-password.component.scss',
})
export class PageSetNewPasswordComponent {}
