import { Component, inject, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AlertComponent } from '@repo/common-components'
import {
    CreateLawFormComponent,
    LawFormDialogResult,
    LawStateService,
    LawTableComponent,
} from '@repo/laws'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-law',
    imports: [RouterModule, PrimeModules, LawTableComponent, AlertComponent],
    templateUrl: './page-law.component.html',
    styleUrl: './page-law.component.scss',
    providers: [LawStateService, DialogService, DynamicDialogRef],
})
export class PageLawComponent implements OnInit {
    private dialogService = inject(DialogService)
    lawStateService = inject(LawStateService)

    showNote = signal<boolean>(true)

    ngOnInit(): void {
        this.lawStateService.init()
    }

    closeNote() {
        this.showNote.set(false)
    }

    onSearch(value: Event) {
        this.lawStateService.setState({
            search: (value.target as HTMLInputElement).value,
        })
    }

    openLawCreateModal() {
        const ref = this.dialogService.open(CreateLawFormComponent, {
            header: 'Create Act',
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
            next: (res: LawFormDialogResult) => {
                if (res?.law) {
                    this.lawStateService.pushLaw(res.law)
                }
            },
        })
    }
}
