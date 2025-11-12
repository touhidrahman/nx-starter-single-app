import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule, NgForm } from '@angular/forms'
import { NoDataComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import {
    GroupInvitationCardComponent,
    InvitationStateService,
    InviteMemberDialogComponent,
} from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService } from 'primeng/dynamicdialog'
import { TablePageEvent } from 'primeng/table'

@Component({
    selector: 'app-invitations-content',
    imports: [
        FormsModule,
        CommonModule,
        ...PrimeModules,
        NoDataComponent,
        GroupInvitationCardComponent,
    ],
    templateUrl: './invitations-content.component.html',
    styleUrl: './invitations-content.component.scss',
    providers: [InvitationStateService],
})
export class InvitationsContentComponent implements OnInit {
    protected invitationStateService = inject(InvitationStateService)
    private alertService = inject(AlertService)
    private dialogService = inject(DialogService)

    ngOnInit(): void {
        this.invitationStateService.init()
    }

    showDialog() {
        const ref = this.dialogService.open(InviteMemberDialogComponent, {
            header: 'Invite Member',
            width: '50vw',
            modal: true,
            dismissableMask: false,
            closable: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe(() => {
            this.invitationStateService.init()
        })
    }

    onSubmitSearch(_form: NgForm) {
        //
    }

    deleteInvite(event: Event, id: string) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Invitation',
            message: 'Are you sure you want to delete this invitation?',
            confirmAction: () => this.onDelete(id),
        }
        this.alertService.confirm(confirmDialogData)
    }

    private onDelete(id: string) {
        this.invitationStateService.deleteInvitation(id).subscribe({
            next: () => {
                this.alertService.success('Invitation deleted successfully')
            },
            error: (error) => {
                this.alertService.error(error.message)
            },
        })
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.invitationStateService.setState({
            page: page,
            size: rows,
        })
    }
}
