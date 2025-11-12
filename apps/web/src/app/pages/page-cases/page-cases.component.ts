import { Component, inject, OnInit } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import {
    Case,
    CaseFilterComponent,
    CaseFormService,
    CaseListStateService,
    CasesTableComponent,
    CreateCaseFormComponent,
    UploadBulkCaseFormComponent,
} from '@repo/case'
import { AlertService } from '@repo/common-services'
import { CourtsListStateService } from '@repo/court'
import { PrimeModules } from '@repo/prime-modules'
import { MenuItem } from 'primeng/api'
import { DialogService } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-cases',
    imports: [
        FormsModule,
        RouterModule,
        CasesTableComponent,
        ReactiveFormsModule,
        PrimeModules,
        CaseFilterComponent,
    ],
    templateUrl: './page-cases.component.html',
    styleUrl: './page-cases.component.scss',
    providers: [CaseFormService, CourtsListStateService],
})
export class PageCasesComponent implements OnInit {
    private alertService = inject(AlertService)
    private dialogService = inject(DialogService)
    protected caseListStateService = inject(CaseListStateService)
    protected courtsListStateService = inject(CourtsListStateService)
    readonly caseFormService = inject(CaseFormService)
    private authStateService = inject(AuthStateService)
    private activatedRoute = inject(ActivatedRoute)
    private router = inject(Router)

    groupId = this.authStateService.getGroupId()
    isFilterClicked = false
    showVideoPopup = false
    sanitizedVideoUrl: SafeResourceUrl

    constructor(private sanitizer: DomSanitizer) {
        const videoId = 'Yg5vlWKTPfo'
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${videoId}`,
        )
    }

    ngOnInit(): void {
        this.caseListStateService.init()
        this.watchErrorMessage()
        this.filterArchivedCases()
    }

    toggleFilter() {
        this.isFilterClicked = !this.isFilterClicked
    }

    onSearch(value: Event) {
        this.caseListStateService.setState({
            search: (value.target as HTMLInputElement).value,
        })
    }

    menuItems: MenuItem[] = [
        {
            label: 'Upload Excel File',
            icon: 'pi pi-upload',
            command: () => this.showUploadDialog(),
        },
    ]

    showMyCase() {
        const userId = this.authStateService.getUserId()
        this.caseListStateService.setState({
            userId: userId as string,
        })
    }

    goToCreateCase() {
        this.router.navigate(['/dashboard/cases/create'])
    }

    openCaseCreateModal() {
        const ref = this.dialogService.open(CreateCaseFormComponent, {
            header: 'Create Case',
            width: '60vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe((data: Case) => {
            if (data) {
                this.caseListStateService.pushCase(data)
            }
        })
    }

    showUploadDialog() {
        const ref = this.dialogService.open(UploadBulkCaseFormComponent, {
            header: 'Upload Excel File',
            width: '90vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe((data: Case[]) => {
            if (data) {
                data.forEach((d) => {
                    this.caseListStateService.pushCase(d)
                })
            }
        })
    }

    private filterArchivedCases() {
        const caseStatus = this.activatedRoute.snapshot.queryParams['status']
        if (caseStatus === 'archived') {
            this.caseListStateService.filterCasesWithStatus(caseStatus)
        }
    }

    private watchErrorMessage() {
        this.caseListStateService.select('errorMessage').subscribe({
            next: (message) => {
                if (message) {
                    this.alertService.error(message)
                }
            },
        })
    }
}
