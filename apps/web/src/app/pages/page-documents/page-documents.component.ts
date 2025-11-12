import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { AuthStateService } from '@repo/auth'
import { NoDataComponent } from '@repo/common-components'
import { IsImagePipe, TextSlicePipe } from '@repo/common-pipes'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { getFileIcon } from '@repo/common-util'
import {
    DocumentFilterComponent,
    DocumentListStateService,
    ViewDocumentModalComponent,
} from '@repo/documents'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { PaginatorModule } from 'primeng/paginator'

@Component({
    selector: 'app-page-documents',
    imports: [
        CommonModule,
        PrimeModules,
        TextSlicePipe,
        IsImagePipe,
        DocumentFilterComponent,
        NoDataComponent,
    ],
    templateUrl: './page-documents.component.html',
    styleUrl: './page-documents.component.scss',
    providers: [DocumentListStateService, PaginatorModule],
})
export class PageDocumentsComponent implements OnInit {
    readonly documentStateService = inject(DocumentListStateService)
    private dialogService = inject(DialogService)
    private alertService = inject(AlertService)
    private sanitizer = inject(DomSanitizer)
    private authStateService = inject(AuthStateService)
    isFilterClicked = false

    getFileIcon = getFileIcon

    ngOnInit(): void {
        this.documentStateService.setState({
            caseId: '',
            page: 1,
            size: 10,
            groupId: this.authStateService.getGroupId() ?? '',
            orderBy: 'desc',
        })
        this.documentStateService.init()
    }

    onPageChange(event: any) {
        this.documentStateService.setState({
            page: event.page + 1,
            size: event.rows,
        })
    }

    onSearch(value: Event) {
        this.documentStateService.setState({
            caseTitle: (value.target as HTMLInputElement).value,
        })
    }

    toggleFilter() {
        this.isFilterClicked = !this.isFilterClicked
    }

    openDocumentModal(key: string) {
        const ref = this.dialogService.open(ViewDocumentModalComponent, {
            header: 'View Document',
            width: '90vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            data: { key },
        })
    }

    confirmDelete(event: Event, id: string) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Document',
            message: 'Are you sure you want to delete this document?',
            confirmAction: () => this.documentStateService.deleteDocument(id),
        }
        this.alertService.confirm(confirmDialogData)
    }
}
