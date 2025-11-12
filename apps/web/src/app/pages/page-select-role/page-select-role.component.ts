import { Component } from '@angular/core'

import { RouterModule } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-select-role',
    imports: [RouterModule, PrimeModules],
    templateUrl: './page-select-role.component.html',
    styleUrl: './page-select-role.component.scss',
})
export class PageSelectRoleComponent {}
