import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { CaseHistoryComponent, CaseStateService } from '@repo/case'
import { injectParams } from 'ngxtension/inject-params'

@Component({
    selector: 'app-page-case-events',
    imports: [CommonModule, CaseHistoryComponent],
    templateUrl: './page-case-events.component.html',
    styleUrl: './page-case-events.component.scss',
})
export class PageCaseEventsComponent {
    caseStateService = inject(CaseStateService)
    id = injectParams('id')
}
