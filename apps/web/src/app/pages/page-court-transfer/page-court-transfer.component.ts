import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Case, CaseHistoryStateService, CaseStateService } from '@repo/case'
import { NoDataComponent } from '@repo/common-components'
import {
    CourtTransferDialogResult,
    CourtTransferListStateService,
    CourtTransferModalComponent,
    CourtTransferTableComponent,
} from '@repo/court'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-court-transfer',
    imports: [
        CommonModule,
        PrimeModules,
        CourtTransferTableComponent,
        NoDataComponent,
    ],
    templateUrl: './page-court-transfer.component.html',
    styleUrl: './page-court-transfer.component.scss',
})
export class PageCourtTransferComponent {
    private caseHistoryStateService = inject(CaseHistoryStateService)
    private dialogService = inject(DialogService)
    private activatedRoute = inject(ActivatedRoute)
    id = signal<string>('')

    protected courtTransferListStateService = inject(
        CourtTransferListStateService,
    )
    protected caseStateService = inject(CaseStateService)

    ngOnInit() {
        this.activatedRoute.parent?.paramMap.subscribe((params) => {
            const paramId = params.get('id')
            this.id.set(paramId as string)
        })

        this.courtTransferListStateService.setState({
            caseId: this.id() ?? '',
        })

        this.courtTransferListStateService.init()
    }

    openTransferModal(caseData: Case) {
        const ref = this.dialogService.open(CourtTransferModalComponent, {
            header: 'Transfer Court',
            width: '60vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '90vw',
                '640px': '95vw',
            },
            data: caseData,
        })

        ref?.onClose.subscribe({
            next: (res: CourtTransferDialogResult) => {
                if (res?.caseTransfer?.case) {
                    this.courtTransferListStateService.pushCourtTransfer(
                        res.caseTransfer.case,
                    )
                    if (res.caseTransfer.caseHistory) {
                        this.caseHistoryStateService.pushCaseHistories(
                            res.caseTransfer.caseHistory,
                        )
                    }
                }
            },
        })
    }
}
