import { Component, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import {
    FeedbackCreateComponent,
    FeedbacksListStateService,
} from '@repo/feedback'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-feedback',
    imports: [...PrimeModules, ReactiveFormsModule, FeedbackCreateComponent],
    templateUrl: './page-feedback.component.html',
    styleUrl: './page-feedback.component.scss',
})
export class PageFeedbackComponent {
    feedbackListStateService = inject(FeedbacksListStateService)
}
