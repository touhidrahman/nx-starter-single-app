import { Component, inject } from '@angular/core'
import { CaseDocumentComponent } from '@repo/case'
import { DocumentFormService, DocumentListStateService } from '@repo/documents'
import { injectParams } from 'ngxtension/inject-params'

@Component({
    selector: 'app-page-case-documents',
    imports: [CaseDocumentComponent],
    templateUrl: './page-case-documents.component.html',
    styleUrl: './page-case-documents.component.scss',
    providers: [DocumentFormService],
})
export class PageCaseDocumentsComponent {
    private documentListStateService = inject(DocumentListStateService)

    id = injectParams('id')

    ngOnInit() {
        this.documentListStateService.init()
        this.documentListStateService.setState({ caseId: this.id() ?? '' })
    }
}
