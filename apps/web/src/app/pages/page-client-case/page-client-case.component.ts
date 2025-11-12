import { AsyncPipe, CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import {
    CASE_DETAILS_CLIENT_ROUTES_DATA,
    CaseDetailsRoutesData,
    CaseHistoryStateService,
    CaseStateService,
    ClientCaseDetailsComponent,
} from '@repo/case'
import { LoaderComponent } from '@repo/common-components'
import { DocumentListStateService } from '@repo/documents'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-client-case',
    imports: [
        PrimeModules,
        ClientCaseDetailsComponent,
        AsyncPipe,
        LoaderComponent,
        RouterModule,
        CommonModule,
    ],
    templateUrl: './page-client-case.component.html',
    styleUrl: './page-client-case.component.scss',
    providers: [
        CaseHistoryStateService,
        CaseStateService,
        DocumentListStateService,
    ],
})
export class PageClientCaseComponent implements OnInit {
    private activatedRoute = inject(ActivatedRoute)
    private router = inject(Router)
    private cdr = inject(ChangeDetectorRef)

    protected caseStateService = inject(CaseStateService)
    caseDetailsRoutesData: CaseDetailsRoutesData[] =
        CASE_DETAILS_CLIENT_ROUTES_DATA

    id = this.activatedRoute.snapshot.paramMap.get('id')

    selectedItem: CaseDetailsRoutesData | null = null

    ngOnInit(): void {
        this.initDefaultRoute()
    }

    private initDefaultRoute(): void {
        if (this.caseDetailsRoutesData.length > 0) {
            this.selectedItem = this.caseDetailsRoutesData[0]
            this.router.navigate([this.selectedItem.path], {
                relativeTo: this.activatedRoute,
            })
        }
    }

    onMobileNavChange(path: string) {
        this.router.navigate([path], { relativeTo: this.activatedRoute })
        this.selectedItem =
            this.caseDetailsRoutesData.find((item) => item.path === path) ||
            null
        this.cdr.detectChanges()
    }
}
