import { AsyncPipe, CommonModule, DatePipe } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NoDataComponent } from '@repo/common-components'
import { PrimeModules } from '@repo/prime-modules'
import {
    SubscriptionFilterComponent,
    SubscriptionStateService,
} from '@repo/subscription'
import { TablePageEvent } from 'primeng/table'

@Component({
    selector: 'app-page-subscription-list',
    imports: [
        CommonModule,
        ...PrimeModules,
        AsyncPipe,
        NoDataComponent,
        DatePipe,
        SubscriptionFilterComponent,
    ],
    templateUrl: './page-subscription-list.component.html',
    styleUrl: './page-subscription-list.component.css',
    providers: [SubscriptionStateService],
})
export class PageSubscriptionListComponent implements OnInit {
    subscriptionStateService = inject(SubscriptionStateService)

    ngOnInit(): void {
        this.subscriptionStateService.init()
    }
    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.subscriptionStateService.setState({
            page: page,
            size: rows,
        })
    }
}
