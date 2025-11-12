import { CommonModule, TitleCasePipe } from '@angular/common'
import { Component, inject, input, OnInit, signal } from '@angular/core'
import { Group } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { CreateSubscriptionComponent } from '@repo/group'
import { Subscription, SubscriptionsApiService } from '@repo/subscription'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-group-subscription',
    imports: [CommonModule, TitleCasePipe, PrimeModules],
    templateUrl: './group-subscription.component.html',
    styleUrl: './group-subscription.component.scss',
    providers: [DialogService],
})
export class GroupSubscriptionComponent implements OnInit {
    private subscriptionApiService = inject(SubscriptionsApiService)
    private alertService = inject(AlertService)
    private dialogService = inject(DialogService)
    private ref = inject(DynamicDialogRef)

    subscription = signal<Subscription | null>(null)
    group = input<Group | null>(null)

    ngOnInit() {
        this.getSubscriptionByGroupId(this.group()?.id ?? '')
    }

    getSubscriptionByGroupId(id: string) {
        this.subscriptionApiService.getSubscriptionByGroupId(id).subscribe({
            next: ({ data }) => {
                this.subscription.set(data)
                this.ref?.close()
            },
            error: (err) => {
                this.alertService.error(err.error.message)
            },
        })
    }

    openSubscriptionDialog() {
        const ref = this.dialogService.open(CreateSubscriptionComponent, {
            header: 'Create Subscription',
            width: '50vw',
            modal: true,
            closable: true,
            style: { overflow: 'auto', padding: '1rem' },
        })

        ref?.onClose.subscribe((_data) => {
            this.getSubscriptionByGroupId(this.group()?.id ?? '')
        })
    }

    formatStorage(val: number): string {
        const KB = 1024
        const MB = 1024 * KB
        const kbValue = val / KB
        if (kbValue > 500) {
            const mbValue = val / MB
            return `${mbValue.toFixed(3)} MB`
        }
        return `${kbValue.toFixed(3)} KB`
    }

    openUpdateSubscriptionDialog(subscription: Subscription) {
        const ref = this.dialogService.open(CreateSubscriptionComponent, {
            header: 'Update Subscription',
            width: '50vw',
            modal: true,
            closable: true,
            style: { overflow: 'auto', padding: '1rem' },
            data: subscription,
        })

        ref?.onClose.subscribe((_data) => {
            this.getSubscriptionByGroupId(this.group()?.id ?? '')
        })
    }
}
