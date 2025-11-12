export enum FeedbackType {
    Feature = 'feature',
    General = 'general',
    Testimonial = 'testimonial',
    Issue = 'issue',
}

export type FeedbackOptionRadioItem = {
    feedbackType: string
    value: FeedbackType
}

export enum FeedbackStatus {
    PENDING = 'pending',
    INPROGRESS = 'inprogress',
    COMPLETE = 'complete',
    INCOMPLETE = 'incomplete',
}

export const FEEDBACK_OPTIONS: FeedbackOptionRadioItem[] = [
    { feedbackType: 'Issue', value: FeedbackType.Issue },
    { feedbackType: 'Feature Request', value: FeedbackType.Feature },
    { feedbackType: 'Testimonial', value: FeedbackType.Testimonial },
    { feedbackType: 'General', value: FeedbackType.General },
]

export interface UploadedFile {
    id: string
    entity: string
    filename: string
    path: string
    url: string
}

export interface FeedbackDto {
    activePage: string
    feedbackText: string
    feedbackType: FeedbackType
    status: FeedbackStatus
    fileUrls: string[]
    creatorName: string
}

export interface Feedback extends FeedbackDto {
    id: string
    createdAt: Date
    updatedAt: Date
}

export type FeedbackFormDialogData = {
    feedback: Feedback | null
}

export type FeedbackFormDialogResult = {
    feedback: Feedback | null
    isEdit: boolean
}
