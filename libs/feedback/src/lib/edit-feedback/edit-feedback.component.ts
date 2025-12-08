import { Component, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { FeedbackApiService } from '../feedback.api.service'
import { Feedback, FeedbackStatus } from '../feedback.model'
import { CreateFeedbackFormService } from '../feedback-form.service'

@Component({
    selector: 'lib-edit-feedback',
    imports: [...PrimeModules, ReactiveFormsModule],
    templateUrl: './edit-feedback.component.html',
    styleUrl: './edit-feedback.component.scss',
    providers: [CreateFeedbackFormService],
})
export class EditFeedbackComponent {
    private feedbackApiService = inject(FeedbackApiService)
    feedbackFormService = inject(CreateFeedbackFormService)
    ref = inject(DynamicDialogRef)
    alertService = inject(AlertService)
    private config = inject<DynamicDialogConfig<Feedback>>(DynamicDialogConfig)

    feedback = this.config.data
    isLoading = signal<boolean>(false)

    statusOptions = [
        { label: 'Pending', value: FeedbackStatus.PENDING },
        { label: 'Inprogress', value: FeedbackStatus.INPROGRESS },
        { label: 'Complete', value: FeedbackStatus.COMPLETE },
        { label: 'Incomplete', value: FeedbackStatus.INCOMPLETE },
    ]

    ngOnInit() {
        if (this.feedback) {
            this.feedbackFormService.form.patchValue({
                status: this.feedback.status,
            })
        }
    }

    close() {
        this.ref?.close()
    }

    updateFeedbackStatus() {
        this.isLoading.set(true)
        const updatedStatus = this.feedbackFormService.form.value.status

        this.feedbackApiService
            .updateFeedback(this.feedback?.id as string, {
                status: updatedStatus as string,
            })
            .subscribe({
                next: (res: ApiResponse<Feedback>) => {
                    this.alertService.success('Feedback status updated successfully')
                    this.ref?.close({
                        feedback: res.data,
                        isEdit: true,
                    })
                },
                error: () => {
                    this.alertService.error('Failed to update feedback status')
                    this.isLoading.set(false)
                },
            })
    }
}
