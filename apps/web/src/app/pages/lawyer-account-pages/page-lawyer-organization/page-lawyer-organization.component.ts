import { Component, signal } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-lawyer-organization',
    imports: [PrimeModules],
    templateUrl: './page-lawyer-organization.component.html',
    styleUrl: './page-lawyer-organization.component.scss',
})
export class PageLawyerOrganizationComponent {
    status = ['active', 'inactive', 'pending']
    type = ['vendor', 'client']
    selected = ''
    visible = signal(false)
    editMode = signal(false)

    organizations = [
        {
            name: 'A ',
            email: 'a@example.com',
            address: 'abc',
            workHour: 5,
            totalMembers: 5,
        },
        {
            name: 'A ',
            email: 'a@example.com',
            address: 'abc',
            workHour: 5,
            totalMembers: 5,
        },
        {
            name: 'A ',
            email: 'a@example.com',
            address: 'abc',
            workHour: 5,
            totalMembers: 5,
        },
    ]

    openCreateOrganizationModal() {
        this.editMode.set(false)
        this.visible.set(true)
    }

    cancel() {
        this.editMode.set(false)
        this.visible.set(false)
    }

    onSave() {}
}
