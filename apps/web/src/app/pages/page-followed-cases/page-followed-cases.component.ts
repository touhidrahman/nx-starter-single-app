import { AsyncPipe, CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import {
    CaseTypeBadgeComponent,
    FollowedCasesStateService,
    PendingFollowRequestCaseComponent,
} from '@repo/case'
import { LoaderComponent, NoDataComponent } from '@repo/common-components'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-followed-cases',
    standalone: true,
    imports: [
        CommonModule,
        PrimeModules,
        AsyncPipe,
        NoDataComponent,
        CaseTypeBadgeComponent,
        LoaderComponent,
        PendingFollowRequestCaseComponent,
    ],
    templateUrl: './page-followed-cases.component.html',
    styleUrl: './page-followed-cases.component.scss',
    providers: [FollowedCasesStateService],
})
export class PageFollowedCasesComponent implements OnInit {
    readonly followedCasesStateService = inject(FollowedCasesStateService)
    private readonly router = inject(Router)

    ngOnInit() {
        this.followedCasesStateService.init(true)
    }

    goToFollowedCase(caseId: string) {
        this.router.navigate(['/client/cases', caseId])
    }
}
