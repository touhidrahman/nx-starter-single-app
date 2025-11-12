import { Component, inject, OnInit } from '@angular/core'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import {
    CourtApiService,
    CourtsListStateService,
    CourtTableComponent,
    CreateCourtFormComponent,
    UploadJsonFormComponent,
} from '@repo/court'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-court',
    imports: [PrimeModules, CourtTableComponent],
    templateUrl: './page-court.component.html',
    styleUrl: './page-court.component.scss',
    providers: [DialogService, DynamicDialogRef, CourtsListStateService],
})
export class PageCourtComponent implements OnInit {
    private dialogService = inject(DialogService)
    private alertService = inject(AlertService)
    private courtApiService = inject(CourtApiService)

    courtsListStateService = inject(CourtsListStateService)
    isFilterClicked = false

    ngOnInit(): void {
        this.courtsListStateService.init()
    }

    toggleFilter() {
        this.isFilterClicked = !this.isFilterClicked
    }

    showCreateDialog() {
        this.openDialog(
            CreateCourtFormComponent,
            'Add Court',
            'create',
            '50vw',
            'center',
        )
    }
    //TODO: for excel file
    // showUploadDialog() {
    //     this.openDialog(
    //         UploadExcelFormComponent,
    //         'Upload Excel File',
    //         'upload',
    //         '60vw',
    //         'center',
    //     )
    // }

    showUploadDialog() {
        const ref = this.dialogService.open(UploadJsonFormComponent, {
            header: 'Upload Json',
            width: '50vw',
            modal: true,
            dismissableMask: false,
            closable: true,
            style: { overflow: 'auto', padding: '1rem' },
        })
    }

    meilisearchIndex() {
        this.courtApiService.indexCourtsToMeilisearch().subscribe({
            next: (result) => {
                this.alertService.success(
                    result?.message || 'Courts indexed successfully',
                )
            },
            error: (error) => {
                this.alertService.error(error?.message || 'Indexing failed')
            },
        })
    }

    confirmIndexing() {
        const confirmDialogData: ConfirmDialogData = {
            title: 'Meilisearch Indexing',
            message: 'Do you want to create indexing in Meilisearch?',
            confirmAction: () => this.meilisearchIndex(),
        }
        this.alertService.confirm(confirmDialogData)
    }

    openDialog(
        component: any,
        header: string,
        mode: 'create' | 'upload',
        width: string,
        position: string,
    ) {
        const ref = this.dialogService.open(component, {
            header: header,
            data: { mode },
            width: width,
            closable: true,
            position: position,
        })
        ref?.onClose.subscribe((data) => {
            if (mode === 'create' && data) {
                const { courts } = this.courtsListStateService.getState()
                this.courtsListStateService.setState({
                    courts: [...courts, data],
                })
            }
        })
    }

    onSearch(value: Event) {
        this.courtsListStateService.setState({
            search: (value.target as HTMLInputElement).value,
        })
    }
}
