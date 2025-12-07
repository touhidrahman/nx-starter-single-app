import { AsyncPipe } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { CauseListDetailsCardComponent, CauseListHeroSectionComponent } from '@repo/cause-list'
import { CauseListStateService } from 'libs/cause-list/src/lib/cause-list-state.service'

@Component({
    selector: 'app-page-cause-list',
    imports: [CauseListDetailsCardComponent, CauseListHeroSectionComponent, AsyncPipe],
    templateUrl: './page-cause-list-case-details.component.html',
    styleUrl: './page-cause-list-case-details.component.css',
    providers: [CauseListStateService],
})
export class PageCauseListCaseDetailsComponent implements OnInit {
    protected causeListStateService = inject(CauseListStateService)
    private activatedRoute = inject(ActivatedRoute)
    private authStateService = inject(AuthStateService)

    isLoading = signal<boolean>(false)
    caseId = signal<string>('')

    ngOnInit(): void {
        this.causeListStateService.init()
        this.setStateAndCaseId()
    }

    private setStateAndCaseId() {
        const caseId = this.activatedRoute.snapshot.paramMap.get('id')
        this.caseId.set(caseId ?? '')
        this.causeListStateService.setState({
            groupId: this.authStateService.getGroupId() as string,
            caseId: this.caseId(),
        })
    }
}
