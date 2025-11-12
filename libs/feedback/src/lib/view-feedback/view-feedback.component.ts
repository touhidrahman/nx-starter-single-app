import { DatePipe } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { TitlecasePipe } from '@repo/common-pipes'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig } from 'primeng/dynamicdialog'
import { Feedback } from '../feedback.model'
import { FeedbacksListStateService } from '../feedback.state.service'

@Component({
    selector: 'lib-view-feedback',
    standalone: true,
    imports: [...PrimeModules, TitlecasePipe, DatePipe],
    templateUrl: './view-feedback.component.html',
    styleUrl: './view-feedback.component.css',
})
export class ViewFeedbackComponent implements OnInit {
    private config = inject(DynamicDialogConfig)
    feedbacksListStateService = inject(FeedbacksListStateService)
    feedback: Feedback | null = null

    ngOnInit(): void {
        if (!this.config.data) {
            return
        }
        this.feedback = this.config.data as Feedback
    }
}
