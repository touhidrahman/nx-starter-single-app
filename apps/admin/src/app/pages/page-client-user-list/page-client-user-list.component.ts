import { AsyncPipe } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
    ClientListStateService,
    ClientListTableComponent,
    CreateClientFormComponent,
} from '@repo/clients'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-client-client-user-list',
    imports: [
        FormsModule,
        PrimeModules,
        AsyncPipe,
        ClientListTableComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './page-client-user-list.component.html',
    styleUrl: './page-client-user-list.component.css',
    providers: [ClientListStateService, DialogService, DynamicDialogRef],
})
export class PageClientUserListComponent implements OnInit {
    clientListStateService = inject(ClientListStateService)
    dialogService = inject(DialogService)

    caseForm!: FormGroup

    ngOnInit() {
        this.clientListStateService.init()
    }

    openClientCreateForm() {
        const ref = this.dialogService.open(CreateClientFormComponent, {
            header: 'Create Client',
            width: '50%',
            modal: true,
            closable: true,
        })
    }

    onSave() {}
}
