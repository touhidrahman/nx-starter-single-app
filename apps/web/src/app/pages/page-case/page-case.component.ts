import { CommonModule, Location } from '@angular/common'
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router'
import { NgIconsModule } from '@ng-icons/core'
import {
    CASE_DETAILS_ROUTES_DATA,
    Case,
    CaseArchiveConfirmDialogComponent,
    CaseArchiveConfirmDialogData,
    CaseArchiveConfirmDialogResult,
    CaseDetailsComponent,
    CaseDetailsRoutesData,
    CaseFollowRequestApiService,
    CaseFollowRequestStateService,
    CaseHistoryStateService,
    CaseReportListStateService,
    CaseStateService,
    CreateCaseFormComponent,
    LinkViewDialogComponent,
} from '@repo/case'
import { ClientListStateService } from '@repo/clients'
import { NoDataComponent } from '@repo/common-components'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import {
    CourtTransferDialogResult,
    CourtTransferListStateService,
    CourtTransferModalComponent,
} from '@repo/court'
import { DocumentFormService, DocumentListStateService } from '@repo/documents'
import { PrimeModules } from '@repo/prime-modules'
import { injectParams } from 'ngxtension/inject-params'
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-case',
    imports: [
        CommonModule,
        NgIconsModule,
        CaseDetailsComponent,
        NoDataComponent,
        RouterModule,
        RouterOutlet,
        PrimeModules,
    ],
    templateUrl: './page-case.component.html',
    styleUrl: './page-case.component.scss',
    providers: [
        CaseFollowRequestStateService,
        CaseHistoryStateService,
        CaseReportListStateService,
        CaseStateService,
        ClientListStateService,
        CourtTransferListStateService,
        DialogService,
        DocumentFormService,
        DocumentListStateService,
        DynamicDialogConfig,
        DynamicDialogRef,
        NgIconsModule,
    ],
})
export class PageCaseComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute)
    private caseHistoryStateService = inject(CaseHistoryStateService)
    private courtTransferListStateService = inject(CourtTransferListStateService)
    private dialogService = inject(DialogService)
    private alertService = inject(AlertService)
    private router = inject(Router)
    private cdr = inject(ChangeDetectorRef)
    private location = inject(Location)

    private caseFollowRequestApiService = inject(CaseFollowRequestApiService)

    protected caseStateService = inject(CaseStateService)
    protected caseDetailsRouterData: CaseDetailsRoutesData[] = CASE_DETAILS_ROUTES_DATA

    id = injectParams('id')

    caseData: Case | null = null
    loading = signal<boolean>(false)
    docUrl: SafeResourceUrl | null = null

    isDropdownOpen = false
    selectedItem: CaseDetailsRoutesData | null = null

    isPinned = false

    ngOnInit() {
        this.caseStateService.setCaseId(this.id())
        this.caseStateService.init()

        this.caseStateService.selectAll().subscribe((state) => {
            this.isPinned = !!state?.case?.isPinned
            this.caseData = state?.case ?? null
        })

        if (this.caseDetailsRouterData?.length > 0) {
            this.selectedItem = this.caseDetailsRouterData[0]
            this.router.navigate([this.selectedItem.path], {
                relativeTo: this.route,
            })
        }
    }

    menuItems = [
        {
            label: this.caseData?.caseStatus === 'archived' ? 'Unarchive' : 'Archive',
            icon: 'pi pi-box',
            command: () => {
                if (this.caseData?.id) {
                    this.openCaseArchiveModal(this.caseData.id, this.caseData.caseStatus)
                }
            },
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            styleClass: 'delete-item',
            command: (event?: any) => {
                if (this.caseData?.id) {
                    this.confirmDelete(event?.originalEvent, this.caseData.id)
                }
            },
        },
    ]

    deleteCase(id: string) {
        this.caseStateService.deleteCase(id).subscribe({
            next: () => {
                this.alertService.success('Deleted successfully')
                this.router.navigate(['/dashboard/cases']) // go back to case list after delete
            },
            error: (error) => {
                this.alertService.error(error)
            },
        })
    }

    confirmDelete(event: Event, id: string) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Case',
            message: 'Are you sure you want to delete this case?',
            confirmAction: () => this.deleteCase(id),
        }
        this.alertService.confirm(confirmDialogData)
    }

    openCaseArchiveModal(caseId: string, currentCaseStatus: 'active' | 'archived') {
        const data: CaseArchiveConfirmDialogData = { caseId, currentCaseStatus }
        const archiveRef = this.dialogService.open(CaseArchiveConfirmDialogComponent, {
            header: `${currentCaseStatus === 'active' ? 'Archive' : 'Unarchive'} case`,
            width: '50%',
            breakpoints: { '960px': '75vw', '640px': '95vw' },
            modal: true,
            closable: true,
            data,
        })

        archiveRef?.onClose.subscribe({
            next: (res: CaseArchiveConfirmDialogResult) => {
                if (res?.id) {
                    this.alertService.success(
                        currentCaseStatus === 'active'
                            ? 'Case archived successfully'
                            : 'Case unarchived successfully',
                    )
                    this.router.navigate(['/dashboard/cases'])
                }
            },
        })
    }

    ngOnDestroy(): void {
        // reset the case state so that next time when a case is loaded, it fetches fresh data
        this.caseStateService.reset()
        this.caseStateService.destroy()
    }

    goBack() {
        this.location.back()
    }

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen
    }

    onMobileNavChange(path: string) {
        this.router.navigate([path], { relativeTo: this.route })
        this.selectedItem = this.caseDetailsRouterData.find((item) => item.path === path) || null
        this.isDropdownOpen = false
        this.cdr.detectChanges()
    }

    onOpenPartiesTab() {
        const partiesRoute = this.caseDetailsRouterData.find((item) =>
            item.title.toLowerCase().includes('parties'),
        )

        if (partiesRoute) {
            this.onMobileNavChange(partiesRoute.path)
        }
    }

    openTransferModal(caseData: Case) {
        const ref = this.dialogService.open(CourtTransferModalComponent, {
            header: 'Transfer Court',
            width: '50vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            data: caseData,
        })

        ref?.onClose.subscribe({
            next: (res: CourtTransferDialogResult) => {
                if (res?.caseTransfer?.case) {
                    this.courtTransferListStateService.pushCourtTransfer(res?.caseTransfer?.case)
                    if (res.caseTransfer.caseHistory) {
                        this.caseHistoryStateService.pushCaseHistories(res.caseTransfer.caseHistory)
                    }
                    this.courtTransferListStateService.init()
                }
            },
        })
    }

    onCaseUpdated(updatedCase: Case) {
        const newCase = {
            ...updatedCase,
            court: updatedCase.court ? { ...updatedCase.court } : null,
            caseParties: updatedCase.caseParties
                ? [...updatedCase.caseParties.map((p) => ({ ...p }))]
                : [],
        }
        this.cdr.detectChanges()
    }

    // === Button Actions ===

    onPinCase(newPinStatus: boolean) {
        if (this.loading()) return
        this.loading.set(true)

        this.caseStateService.pinOrUnpinCase(newPinStatus).subscribe({
            next: ({ data }) => {
                this.alertService.success(
                    data.isPinned ? 'Pinned successfully' : 'Unpinned successfully',
                )
                this.isPinned = data.isPinned
                this.loading.set(false)
            },
            error: () => {
                this.loading.set(false)
                this.alertService.error('Failed to update pin status')
            },
        })
    }

    generateLink() {
        this.caseFollowRequestApiService
            .generateCaseFollowLink(
                this.caseStateService.getState().caseId ?? '',
                '7', // 7 days validity
            )
            .subscribe({
                next: ({ data }) => {
                    if (data.url) {
                        this.dialogService.open(LinkViewDialogComponent, {
                            header: 'Case Follow Link',
                            width: '50vw',
                            modal: true,
                            closable: true,
                            contentStyle: { overflow: 'auto' },
                            breakpoints: {
                                '960px': '75vw',
                                '640px': '90vw',
                            },
                            data: data.url,
                        })
                    }
                },
            })
    }

    onEdit(data: Case) {
        const ref = this.dialogService.open(CreateCaseFormComponent, {
            header: 'Update Case',
            width: '50vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            data,
        })

        ref?.onClose.subscribe((res) => {
            if (res) {
                this.caseStateService.replaceCase(res)
                this.onCaseUpdated(res)
            }
        })
    }
}
