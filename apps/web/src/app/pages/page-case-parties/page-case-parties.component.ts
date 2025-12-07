import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CaseParty, CasePartyContainerComponent, CaseStateService } from '@repo/case'

@Component({
    selector: 'app-page-case-parties',
    imports: [CommonModule, CasePartyContainerComponent],
    templateUrl: './page-case-parties.component.html',
    styleUrl: './page-case-parties.component.scss',
})
export class PageCasePartiesComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute)
    caseStateService = inject(CaseStateService)

    id = signal<string>('')

    ngOnInit(): void {
        this.activatedRoute.parent?.paramMap.subscribe((params) => {
            const paramId = params.get('id')
            this.id.set(paramId as string)
        })

        this.caseStateService.init()
        this.caseStateService.setState({ caseId: this.id() ?? '' })
    }

    updateCasePartiesInState(caseParties: CaseParty[]) {
        this.caseStateService.setState({ caseParties })
    }
}
