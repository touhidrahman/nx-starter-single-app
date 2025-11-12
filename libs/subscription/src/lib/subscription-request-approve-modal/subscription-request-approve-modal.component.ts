import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { MathVerificationComponent } from '@repo/common-components'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { SubscriptionRequestStateService } from '../subscription-request-state.service'

@Component({
    selector: 'app-subscription-request-approve-modal',
    imports: [CommonModule, PrimeModules, MathVerificationComponent],
    templateUrl: './subscription-request-approve-modal.component.html',
    styleUrl: './subscription-request-approve-modal.component.css',
    providers: [SubscriptionRequestStateService],
})
export class SubscriptionRequestApproveModalComponent {
    private ref = inject(DynamicDialogRef)
    private subscriptionRequestStateService = inject(
        SubscriptionRequestStateService,
    )
    private alertService = inject(AlertService)
    readonly config = inject(DynamicDialogConfig)

    isMathVerified = signal<boolean>(false)

    isError = signal<boolean>(false)
    isLoading = signal<boolean>(false)

    onApproveSubscriptionRequest() {
        this.isLoading.set(true)
        this.subscriptionRequestStateService
            .updateSubscriptionRequest(
                this.config.data.id,
                this.config.data.groupId,
            )
            .subscribe({
                next: (res) => {
                    this.isLoading.set(false)
                    this.alertService.success('Subscription request approved!')
                    this.ref?.close(res.data)
                },
                error: (err) => {
                    this.isLoading.set(false)
                    this.isError.set(true)
                    this.alertService.error(err.message.message)
                },
            })
    }

    onVerified(isVerified: boolean) {
        this.isMathVerified.set(isVerified)
    }

    onCloseModal() {
        this.ref?.close()
    }
}
