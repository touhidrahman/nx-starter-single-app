import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ClientCaseHistoryComponent } from '@repo/case'

@Component({
    selector: 'app-page-client-organization-case-history',
    imports: [CommonModule, ClientCaseHistoryComponent],
    templateUrl: './page-client-organization-case-history.component.html',
    styleUrl: './page-client-organization-case-history.component.css',
})
export class PageClientOrganizationCaseHistoryComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute)
    id = signal('')

    ngOnInit(): void {
        const caseId = this.activatedRoute?.parent?.snapshot.paramMap.get('id')
        this.id.set(caseId ?? '')
    }
}
