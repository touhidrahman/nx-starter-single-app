import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms'
import {
    CaseListStateService,
    CaseReportFormComponent,
    CaseReportFormDialogResult,
    CaseReportListStateService,
    CaseReportTableComponent,
} from '@repo/case'
import { PrimeModules } from '@repo/prime-modules'
import {
    AutoComplete,
    AutoCompleteCompleteEvent,
    AutoCompleteSelectEvent,
} from 'primeng/autocomplete'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-case-reports',
    imports: [
        CommonModule,
        PrimeModules,
        ReactiveFormsModule,
        FormsModule,
        AutoComplete,
        CaseReportTableComponent,
    ],
    templateUrl: './page-case-reports.component.html',
    styleUrl: './page-case-reports.component.scss',
    providers: [CaseReportListStateService, DialogService, DynamicDialogRef],
})
export class PageCaseReportsComponent implements OnInit {
    caseListStateService = inject(CaseListStateService)
    caseReportListStateService = inject(CaseReportListStateService)
    dialogService = inject(DialogService)

    caseForm!: FormGroup

    ngOnInit() {
        this.caseListStateService.init()
        this.caseReportListStateService.init()
        this.caseForm = new FormGroup({
            selectedCase: new FormControl(),
        })
    }

    filterCase(_event: AutoCompleteCompleteEvent) {
        // const query = (event.originalEvent.target as HTMLInputElement).value
        // this.caseListStateService.setState({
        //     searchTerm: query,
        // })
    }

    onSelect(event: AutoCompleteSelectEvent) {
        this.caseReportListStateService.setState({ caseId: event.value.id })
    }

    onClear() {
        this.caseReportListStateService.setState({ caseId: '' })
    }

    openCaseReportForm() {
        const ref = this.dialogService.open(CaseReportFormComponent, {
            header: 'Create Case Report',
            width: '50vw',
            modal: true,
            style: { overflow: 'auto' },
            closeOnEscape: true,
            dismissableMask: true,
            closable: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe({
            next: (res: CaseReportFormDialogResult) => {
                if (res?.caseReport) {
                    if (res.isEdit) {
                        this.caseReportListStateService.replaceCaseReport(
                            res.caseReport,
                        )
                    } else {
                        this.caseReportListStateService.pushCaseReport(
                            res.caseReport,
                        )
                    }
                }
            },
        })
    }
}
