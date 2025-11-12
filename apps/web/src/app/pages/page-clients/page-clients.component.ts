import { Component, inject, input } from '@angular/core'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import {
    ClientFormDialogResult,
    ClientListStateService,
    ClientListTableComponent,
    CreateClientFormComponent,
} from '@repo/clients'
import { PrimeModules } from '@repo/prime-modules'
import {
    AutoCompleteCompleteEvent,
    AutoCompleteSelectEvent,
} from 'primeng/autocomplete'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-clients',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        PrimeModules,
        ClientListTableComponent,
    ],
    templateUrl: './page-clients.component.html',
    styleUrl: './page-clients.component.scss',
    providers: [ClientListStateService, DynamicDialogRef, DialogService],
})
export class PageClientsComponent {
    clientListStateService = inject(ClientListStateService)
    dialogService = inject(DialogService)

    id = input<string>('')

    caseForm!: FormGroup<{
        selectedCase: FormControl<string[]>
    }>

    ngOnInit() {
        this.clientListStateService.init()
        this.caseForm = new FormGroup({
            selectedCase: new FormControl(),
        })
    }

    filterCase(event: AutoCompleteCompleteEvent) {
        const query = (event.originalEvent.target as HTMLInputElement).value
        this.clientListStateService.setState({
            search: query,
        })
    }

    onSelect(_event: AutoCompleteSelectEvent) {
        //this.clientListStateService.setState({ groupId: event.value.id })
    }

    onClear() {
        //this.clientListStateService.setState({  })
    }

    openClientCreateForm() {
        const ref = this.dialogService.open(CreateClientFormComponent, {
            header: 'Create Client',
            width: '50vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe({
            next: (res: ClientFormDialogResult) => {
                if (res?.client) {
                    this.clientListStateService.pushClient(res.client)
                }
            },
        })
    }

    onSearch(value: Event) {
        this.clientListStateService.setState({
            search: (value.target as HTMLInputElement).value,
        })
    }
}
