import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import {
    GroupMembersComponent,
    LoggedInGroupStateService,
    OrganizationHeaderComponent,
} from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-organization-content',
    imports: [
        ...PrimeModules,
        AsyncPipe,
        OrganizationHeaderComponent,
        GroupMembersComponent,
    ],
    templateUrl: './organization-content.component.html',
    styleUrl: './organization-content.component.scss',
})
export class OrganizationContentComponent {
    readonly authStateService = inject(AuthStateService)
    readonly loggedInGroupStateService = inject(LoggedInGroupStateService)
}
