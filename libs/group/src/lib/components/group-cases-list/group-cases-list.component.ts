import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { CaseListStateService } from '@repo/case'
import { UtcDatePipe } from '../../../../../common-pipes/src/lib/utcDate.pipe'

@Component({
    selector: 'app-group-cases-list',
    imports: [PrimeModules, UtcDatePipe, CommonModule],
    templateUrl: './group-cases-list.component.html',
    styleUrl: './group-cases-list.component.css',
    providers: [CaseListStateService],
})
export class GroupCasesListComponent implements OnInit {
    private route = inject(ActivatedRoute)
    readonly caseListStateService = inject(CaseListStateService)

    cases = toSignal(this.caseListStateService.select('cases'), {
        initialValue: [],
    })
    loading = toSignal(this.caseListStateService.select('loading'), {
        initialValue: true,
    })

    ngOnInit(): void {
        this.route.parent?.paramMap.subscribe((params) => {
            const groupId = params.get('groupId')
            if (groupId) {
                this.caseListStateService.setGroupId(groupId)
                this.caseListStateService.init()
            }
        })
    }
}
