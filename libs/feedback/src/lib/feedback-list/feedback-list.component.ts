import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NoDataComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { AlertService, ConfirmDialogData } from '@repo/common-services'
import { getFileIcon } from '@repo/common-util'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService } from 'primeng/dynamicdialog'
import { EditFeedbackComponent } from '../edit-feedback/edit-feedback.component'
import { FeedbackApiService } from '../feedback.api.service'
import { Feedback, FeedbackStatus, FeedbackType } from '../feedback.model'
import { FeedbacksListStateService } from '../feedback.state.service'
import { ViewFeedbackComponent } from '../view-feedback/view-feedback.component'
import { ViewFeedbackDocumentComponent } from '../view-feedback-document/view-feedback-document.component'

@Component({
    selector: 'lib-feedback-list',
    standalone: true,
    imports: [CommonModule, ...PrimeModules, NoDataComponent, FormsModule],
    templateUrl: './feedback-list.component.html',
    styleUrl: './feedback-list.component.scss',
})
export class FeedbackListComponent {
    private feedbackApiService = inject(FeedbackApiService)
    feedbacksListStateService = inject(FeedbacksListStateService)
    private alertService = inject(AlertService)
    dialogService = inject(DialogService)

    getFileIcon = getFileIcon

    isLoading = signal<boolean>(true)
    isError = signal<boolean>(false)
    showFilter = signal(false)

    feedbackList: Feedback[] = []
    filteredFeedbackList: Feedback[] = []
    searchText = ''

    // Filter properties
    selectedStatus: FeedbackStatus | null = null
    selectedType: FeedbackType | null = null

    // Options for dropdowns
    statusOptions = [
        { label: 'Pending', value: FeedbackStatus.PENDING },
        { label: 'In Progress', value: FeedbackStatus.INPROGRESS },
        { label: 'Complete', value: FeedbackStatus.COMPLETE },
        { label: 'Incomplete', value: FeedbackStatus.INCOMPLETE },
    ]

    typeOptions = [
        { label: 'Feature', value: FeedbackType.Feature },
        { label: 'General', value: FeedbackType.General },
        { label: 'Testimonial', value: FeedbackType.Testimonial },
        { label: 'Issue', value: FeedbackType.Issue },
    ]

    ngOnInit() {
        this.getFeedback()
    }

    getFeedback() {
        this.isLoading.set(true)
        this.feedbackApiService
            .getAllFeedbacks({ page: 1, size: 10, orderBy: 'asc', search: '' })
            .subscribe({
                next: (response: ApiResponse<Feedback[]>) => {
                    this.feedbackList = response?.data || []
                    this.filteredFeedbackList = [...this.feedbackList]
                },
                error: (_error) => {
                    this.alertService.error('Failed to fetch feedback')
                },
                complete: () => {
                    this.isLoading.set(false)
                },
            })
    }

    applyFilters() {
        this.filteredFeedbackList = this.feedbackList.filter((feedback) => {
            // Status filter
            const statusMatch = this.selectedStatus
                ? feedback.status === this.selectedStatus
                : true

            // Type filter
            const typeMatch = this.selectedType
                ? feedback.feedbackType === this.selectedType
                : true

            // Search text filter (case insensitive)
            const searchMatch = this.searchText
                ? feedback.feedbackText
                      .toLowerCase()
                      .includes(this.searchText.toLowerCase()) ||
                  feedback.activePage
                      .toLowerCase()
                      .includes(this.searchText.toLowerCase())
                : true

            return statusMatch && typeMatch && searchMatch
        })
        this.showFilter.set(false)
    }

    resetFilter() {
        this.selectedStatus = null
        this.selectedType = null
        this.searchText = ''
        this.filteredFeedbackList = [...this.feedbackList]
        this.showFilter.set(false)
    }

    openDocumentViewer(files: string[]) {
        const ref = this.dialogService.open(ViewFeedbackDocumentComponent, {
            header: 'Document Viewer',
            width: '80vw',
            height: '90vh',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: {
                files: files,
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })

        ref?.onClose.subscribe(() => {})
    }

    viewFeedback(feedback: Feedback) {
        const viewRef = this.dialogService.open(ViewFeedbackComponent, {
            header: 'View Feedback',
            width: '50vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            data: feedback,
        })

        viewRef?.onClose.subscribe({
            next: () => {
                console.log('View dialog closed')
            },
        })
    }

    getStatusClass(statusValue: FeedbackStatus): string {
        const baseClasses = 'me-2 rounded-sm px-2.5 py-0.5 text-xs font-medium'

        switch (statusValue) {
            case FeedbackStatus.PENDING:
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case FeedbackStatus.INPROGRESS:
                return `${baseClasses} bg-blue-100 text-blue-800`
            case FeedbackStatus.COMPLETE:
                return `${baseClasses} bg-lime-100 text-lime-800`
            case FeedbackStatus.INCOMPLETE:
                return `${baseClasses} bg-red-100 text-red-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    EditFeedback(feedback: Feedback) {
        const ref = this.dialogService.open(EditFeedbackComponent, {
            header: 'Edit Feedback Status',
            width: '50vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            data: feedback,
        })

        ref?.onClose.subscribe({
            next: (res: { feedback: Feedback; isEdit: boolean }) => {
                if (res?.feedback && res.isEdit) {
                    this.feedbacksListStateService.replaceFeedback(res.feedback)
                    this.getFeedback()
                }
            },
        })
    }

    confirmDelete(event: Event, feedbackId: string) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Delete Feedback',
            message: `Are you sure you want to delete ${feedbackId}?`,
            confirmAction: () => this.onDeleteFeedback(feedbackId),
        }
        this.alertService.confirm(confirmDialogData)
    }

    private onDeleteFeedback(feedbackId: string) {
        this.isLoading.set(true)
        this.feedbacksListStateService.deleteFeedBack(feedbackId).subscribe({
            next: (_res) => {
                this.alertService.success('Feedback deleted successfully')
                this.isLoading.set(false)
                this.getFeedback()
            },
            error: (err) => {
                this.alertService.error(
                    err?.message || 'Failed to delete feedback',
                )
            },
        })
    }
}
