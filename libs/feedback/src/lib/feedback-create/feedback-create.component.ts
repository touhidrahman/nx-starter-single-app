import { Component, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { FileUpload } from 'primeng/fileupload'
import { FeedbackApiService } from '../feedback.api.service'
import { FeedbacksListStateService } from '../feedback.state.service'
import { CreateFeedbackFormService } from '../feedback-form.service'

@Component({
    selector: 'lib-feedback-create',
    imports: [...PrimeModules, ReactiveFormsModule],
    templateUrl: './feedback-create.component.html',
    styleUrl: './feedback-create.component.css',
})
export class FeedbackCreateComponent {
    readonly feedbackFormService = inject(CreateFeedbackFormService)
    private feedApiService = inject(FeedbackApiService)
    readonly feedbackListStateService = inject(FeedbacksListStateService)
    private router = inject(Router)

    isLoading = signal(false)
    isEdit = signal(false)

    private getCurrentRoute(): string {
        return this.router.url.split('?')[0]
    }

    onSubmit(event: Event, fileUpload: FileUpload) {
        this.isLoading.set(true)
        event?.preventDefault()

        const formData = this.feedbackFormService.toFormData(this.getCurrentRoute())

        this.saveFeedbackData(formData, fileUpload)
    }

    onFileSelect(event: { files: File[] }): void {
        const currentAttachments: File[] =
            this.feedbackFormService.form.get('attachments')?.value || []
        this.feedbackFormService.form.patchValue({
            attachments: [...currentAttachments, ...event.files],
        })
    }

    onFileRemove(event: { file: File }): void {
        const currentAttachments: File[] =
            this.feedbackFormService.form.get('attachments')?.value || []
        const updatedAttachments = currentAttachments.filter(
            (file: File) => file.name !== event.file.name,
        )
        this.feedbackFormService.form.patchValue({
            attachments: updatedAttachments,
        })
    }

    onResetAttachments(fileUpload: FileUpload) {
        fileUpload.clear()
        this.feedbackFormService.form.patchValue({ attachments: [] })
    }

    private saveFeedbackData(formData: FormData, fileUpload: FileUpload) {
        this.feedApiService.createFeedback(formData).subscribe({
            next: () => {
                this.isLoading.set(false)
                this.feedbackFormService.form.reset()
                fileUpload.clear()
                this.feedbackFormService.form.patchValue({ attachments: [] })
                this.feedbackFormService.checkSubmitted()
                this.router.navigate(['/dashboard/feedback-success'])
            },
            error: (error: unknown) => {
                this.isLoading.set(false)
                const apiError = error as { error?: { message?: string } }
                this.router.navigate(['/dashboard/feedback/feedback-failed'])
            },
        })
    }
}
