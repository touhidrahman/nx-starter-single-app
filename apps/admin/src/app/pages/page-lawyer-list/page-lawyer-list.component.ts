import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NoDataComponent } from '@repo/common-components'
import { OrderBy } from '@repo/common-models'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import {
    AddLawyerDialogComponent,
    Lawyer,
    LawyerFormDialogData,
    LawyerFormDialogResult,
    LawyerFormService,
    LawyerStateService,
    PublicLawyerFilterComponent,
} from '@repo/lawyer'
import { PrimeModules } from '@repo/prime-modules'
import { Button } from 'primeng/button'
import { DialogService } from 'primeng/dynamicdialog'
import { InputText } from 'primeng/inputtext'
import { TablePageEvent } from 'primeng/table'

@Component({
    selector: 'app-page-lawyer-list',
    imports: [
        CommonModule,
        Button,
        InputText,
        FormsModule,
        RouterModule,
        ...PrimeModules,
        NoDataComponent,
        PublicLawyerFilterComponent,
    ],
    templateUrl: './page-lawyer-list.component.html',
    styleUrl: './page-lawyer-list.component.css',
    providers: [LawyerStateService, LawyerFormService],
})
export class PageLawyerListComponent implements OnInit {
    readonly lawyerStateService = inject(LawyerStateService)
    readonly lawyerFormService = inject(LawyerFormService)
    private alertService = inject(AlertService)
    private dialogService = inject(DialogService)

    isFilterModal = signal(false)

    allLawyers: Lawyer[] = []
    isLoading = false
    isError = false
    filterOptions = {
        search: '',
        size: 10,
        page: 1,
        orderBy: OrderBy.Asc,
    }

    openDialog(lawyer: Lawyer | null) {
        const isUpdate = lawyer !== null
        const header = lawyer ? 'Edit  Lawyer' : 'Add new Lawyer'
        const data: LawyerFormDialogData = {
            lawyer,
        }
        const ref = this.dialogService.open(AddLawyerDialogComponent, {
            header: header,
            width: '75vw',
            height: '100vh',
            modal: true,
            dismissableMask: false,
            closable: true,
            data,
        })

        ref?.onClose.subscribe({
            next: (res: LawyerFormDialogResult) => {
                if (res?.lawyer) {
                    if (isUpdate) {
                        this.lawyerStateService.replaceLawyer(res.lawyer)
                    } else {
                        this.lawyerStateService.pushLawyer(res.lawyer)
                    }
                }
            },
        })
    }

    openFilterModal() {
        this.isFilterModal.set(true)
    }

    closeFilterModal() {
        this.isFilterModal.set(false)
    }

    ngOnInit() {
        this.lawyerStateService.init()
    }

    onLawyerSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.lawyerStateService.setState({
            search: value,
            page: 1, // Reset page when searching
        })
    }

    onDeleteLawyers(id: string) {
        this.lawyerStateService.deleteLawyer(id).subscribe({
            next: () => this.alertService.success('Lawyer deleted successfully.'),
            error: (err) => this.alertService.error(err.message),
        })
    }

    confirmDelete(event: Event, lawyer: Lawyer) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Lawyers',
            message: `Are you sure you want to delete ${lawyer.id}?`,
            confirmAction: () => this.onDeleteLawyers(lawyer.id),
        }
        this.alertService.confirm(confirmDialogData)
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.lawyerStateService.setState({
            page: page,
            size: rows,
        })
    }
}
