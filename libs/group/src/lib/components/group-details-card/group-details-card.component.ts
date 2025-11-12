import { Component, input } from '@angular/core'
import { Group } from '@repo/common-auth'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-group-details-card',
    imports: [PrimeModules],
    templateUrl: './group-details-card.component.html',
    styleUrl: './group-details-card.component.scss',
})
export class GroupDetailsCardComponent {
    group = input<Group | null>(null)
}
