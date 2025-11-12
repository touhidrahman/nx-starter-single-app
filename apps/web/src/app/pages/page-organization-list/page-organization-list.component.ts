import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { OrganizationType } from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-organization-list',
    imports: [CommonModule, PrimeModules, RouterModule],
    templateUrl: './page-organization-list.component.html',
    styleUrl: './page-organization-list.component.css',
})
export class PageOrganizationListComponent {
    authStateService = inject(AuthStateService)
    groupType = OrganizationType

    // group: Group | null = null

    // ngOnInit(): void {
    //   // this.group = this.authStateService.getState()
    //   sasas

    // }
}
