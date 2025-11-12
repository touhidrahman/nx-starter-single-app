import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { Group } from '@repo/common-auth'

@Component({
    selector: 'app-organization-header',
    imports: [CommonModule],
    templateUrl: './organization-header.component.html',
    styleUrl: './organization-header.component.scss',
})
export class OrganizationHeaderComponent {
    organization = input.required<Group>()
    organizationCreatorName = input.required<string>()
}
