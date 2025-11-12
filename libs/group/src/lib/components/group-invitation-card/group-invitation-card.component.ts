import { CommonModule } from '@angular/common'
import { Component, input, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'
import { Invitation } from '../../invitation.model'
import { InvitationStateService } from '../../invitation-state.service'

@Component({
    selector: 'app-group-invitation-card',
    imports: [FormsModule, CommonModule, ...PrimeModules],
    templateUrl: './group-invitation-card.component.html',
    styleUrl: './group-invitation-card.component.css',
    providers: [InvitationStateService],
})
export class GroupInvitationCardComponent {
    invitation = input.required<Invitation>()
    delete = output<{ event: Event; id: string }>()

    onDelete(event: Event) {
        this.delete.emit({ event, id: this.invitation().id })
    }
}
