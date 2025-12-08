import { Injectable, inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { AbstractFormService } from '@repo/common-services'
import { maxFilesLength } from '@repo/filestore'
import { FeedbackApiService } from './feedback.api.service'
import { FEEDBACK_OPTIONS, Feedback, FeedbackDto, FeedbackOptionRadioItem } from './feedback.model'

@Injectable({
    providedIn: 'root',
})
export class CreateFeedbackFormService extends AbstractFormService<FeedbackDto> {
    override form: FormGroup
    override fb = inject(FormBuilder)
    feedbackOptions: FeedbackOptionRadioItem[] = FEEDBACK_OPTIONS
    formSubmitted = false

    constructor() {
        super(inject(FormBuilder), inject(FeedbackApiService))
        this.form = this.buildForm()
    }

    buildForm(): FormGroup {
        return this.fb.nonNullable.group({
            feedbackType: ['issue', [Validators.required]],
            feedbackText: ['', [Validators.required]],
            attachments: [[], [maxFilesLength(5)]],
            status: [''],
        })
    }

    controls(control: string) {
        return this.form.get(control)
    }

    getValue() {
        return this.form.getRawValue()
    }

    patchForm(data: Feedback) {
        this.form.patchValue(data)
    }

    toFormData(activePage: string): FormData {
        const formValue = this.getValue()
        const formData = new FormData()

        formData.append('feedbackType', formValue.feedbackType)
        formData.append('feedbackText', formValue.feedbackText)
        formData.append('activePage', activePage)

        for (const file of formValue.attachments ?? []) {
            if (file instanceof File) {
                formData.append('files', file, file.name)
            }
        }

        return formData
    }

    checkSubmitted() {
        this.formSubmitted = true
    }
}
