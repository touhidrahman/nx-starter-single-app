import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { CaseFollowRequestApiService, CaseListForFollower } from '@repo/case'
import { LoaderComponent, NoDataComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { PrimeModules } from '@repo/prime-modules'
import { ButtonModule } from 'primeng/button'
import { TableModule } from 'primeng/table'

@Component({
    selector: 'app-page-client-organizations',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        PrimeModules,
        NoDataComponent,
        LoaderComponent,
    ],
    templateUrl: './page-client-organizations.component.html',
    styleUrls: ['./page-client-organizations.component.scss'],
})
export class PageClientOrganizationsComponent implements OnInit {
    private readonly router = inject(Router)
    private caseFollowRequestApiService = inject(CaseFollowRequestApiService)

    groupCases = signal<CaseListForFollower[]>([])
    isLoading = signal<boolean>(true)
    expandedGroupName = signal<string | null>(null)

    ngOnInit(): void {
        this.getFollowCasesFilteredByGroup()
    }

    goToFollowedCase(caseId: string) {
        this.router.navigate(['/client/cases', caseId])
    }

    onToggleGroup(groupName: string) {
        this.expandedGroupName.set(
            this.expandedGroupName() === groupName ? null : groupName,
        )
    }

    private getFollowCasesFilteredByGroup() {
        this.isLoading.set(true)
        this.caseFollowRequestApiService
            .getAllFollowedCasesGroupedByOrganization()
            .subscribe({
                next: (res: ApiResponse<CaseListForFollower[]>) => {
                    this.isLoading.set(false)
                    this.groupCases.set(res.data)
                },
            })
    }
}
