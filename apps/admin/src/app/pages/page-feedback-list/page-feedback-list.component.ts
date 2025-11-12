import { Component } from '@angular/core'
import { FeedbackListComponent } from '@repo/feedback'

@Component({
    imports: [FeedbackListComponent],
    templateUrl: './page-feedback-list.component.html',
    styleUrl: './page-feedback-list.component.scss',
})
export class PageFeedbackListComponent {}
