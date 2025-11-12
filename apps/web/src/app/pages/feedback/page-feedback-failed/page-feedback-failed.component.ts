import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
    selector: 'app-page-feedback-failed',
    imports: [CommonModule, RouterLink],
    templateUrl: './page-feedback-failed.component.html',
    styleUrl: './page-feedback-failed.component.css',
})
export class PageFeedbackFailedComponent {}
