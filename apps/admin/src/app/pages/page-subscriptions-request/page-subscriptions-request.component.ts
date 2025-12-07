import { AsyncPipe, CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { PrimeModules } from '@repo/prime-modules'
import {
    SubscriptionRequest,
    SubscriptionRequestApproveModalComponent,
    SubscriptionRequestStateService,
} from '@repo/subscription'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { TablePageEvent } from 'primeng/table'

@Component({
    selector: 'app-page-subscriptions-request',
    imports: [
        CommonModule,
        ...PrimeModules,
        AsyncPipe,
        NoDataComponent,
        // DatePipe,
        // SubscriptionFilterComponent,
    ],
    templateUrl: './page-subscriptions-request.component.html',
    styleUrl: './page-subscriptions-request.component.css',
    providers: [SubscriptionRequestStateService, DynamicDialogRef],
})
export class PageSubscriptionsRequestComponent implements OnInit {
    private dialogService = inject(DialogService)
    readonly subscriptionsRequestStateService = inject(SubscriptionRequestStateService)

    ngOnInit(): void {
        this.subscriptionsRequestStateService.init()
    }

    onOpenSubscriptionOpenModal(data: SubscriptionRequest) {
        const ref = this.dialogService.open(SubscriptionRequestApproveModalComponent, {
            header: 'Approve Subscription Request',
            width: '50vw',
            breakpoints: {
                '1920px': '800px',
                '1200px': '600px',
                '960px': '75vw',
                '640px': '90vw',
            },
            modal: true,
            dismissableMask: false,
            closable: true,
            data: data,
        })

        ref?.onClose.subscribe((res) => {
            if (res) {
                this.subscriptionsRequestStateService.updateRequest(data.id ?? '', res)
            }
        })
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.subscriptionsRequestStateService.setState({
            page: page,
            size: rows,
        })
    }
}
