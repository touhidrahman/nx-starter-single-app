import { Injectable, inject } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { CreateFeedbackFormService } from './feedback-form.service'

@Injectable({
    providedIn: 'root',
})
export class FeedbackGuard implements CanActivate {
    private feedbackFormService = inject(CreateFeedbackFormService)
    private router = inject(Router)

    canActivate(): boolean {
        if (this.feedbackFormService.formSubmitted) {
            return true
        }

        this.router.navigate(['/dashboard/feedback'])
        return false
    }
}
