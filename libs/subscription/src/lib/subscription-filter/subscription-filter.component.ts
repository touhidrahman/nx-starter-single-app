import { CommonModule } from '@angular/common'
import {
    Component,
    ElementRef,
    HostListener,
    inject,
    signal,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { LabelValuePair } from '@repo/common-models'
import { PrimeModules } from '@repo/prime-modules'
import {
    SubscriptionState,
    SubscriptionStateService,
    SubscriptionStatus,
    SubscriptionType,
} from '@repo/subscription'

@Component({
    selector: 'app-subscription-filter',
    imports: [CommonModule, PrimeModules, FormsModule],
    templateUrl: './subscription-filter.component.html',
    styleUrl: './subscription-filter.component.css',
})
export class SubscriptionFilterComponent {
    subscriptionStateService = inject(SubscriptionStateService)
    elementRef = inject(ElementRef)

    showFilter = signal(false)

    // Filter properties
    selectedPlan: string | null = null
    selectedSubscriptionType: SubscriptionType | null = null
    selectedStatus: SubscriptionStatus | null = null
    selectedPaymentMethod: string | null = null

    // Options for dropdowns
    planOptions: LabelValuePair<string>[] = [
        // These should be populated from your backend or state service
        { label: 'Free', value: 'Free' },
        { label: 'Bronze', value: 'Bronze' },
        { label: 'Silver', value: 'Silver' },
        { label: 'Gold', value: 'Gold' },
    ]

    subscriptionTypeOptions: LabelValuePair<SubscriptionType>[] = [
        { label: 'Monthly', value: SubscriptionType.MONTHLY },
        { label: 'Yearly', value: SubscriptionType.YEARLY },
    ]

    statusOptions: LabelValuePair<SubscriptionStatus>[] = [
        { label: 'Active', value: SubscriptionStatus.ACTIVE },
        { label: 'Inactive', value: SubscriptionStatus.INACTIVE },
    ]

    paymentMethodOptions: LabelValuePair<string>[] = [
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'PayPal', value: 'paypal' },
    ]

    ngOnInit() {
        const currentState = this.subscriptionStateService.getState()
        this.selectedPlan = currentState.plan || null
        this.selectedSubscriptionType =
            currentState.subscriptionType &&
            Object.values(SubscriptionType).includes(
                currentState.subscriptionType as SubscriptionType,
            )
                ? (currentState.subscriptionType as SubscriptionType)
                : null
        this.selectedStatus =
            currentState.status &&
            Object.values(SubscriptionStatus).includes(
                currentState.status as SubscriptionStatus,
            )
                ? (currentState.status as SubscriptionStatus)
                : null
    }

    closeFilter() {
        this.showFilter.set(false)
    }

    applyFilters() {
        const filters: Partial<SubscriptionState> = {
            plan: this.selectedPlan || undefined,
            subscriptionType: this.selectedSubscriptionType || undefined,
            status: this.selectedStatus || undefined,

            page: 1, // Reset to first page when applying new filters
        }

        this.subscriptionStateService.setState(filters)
        this.closeFilter()
    }

    resetFilter() {
        this.selectedPlan = null
        this.selectedSubscriptionType = null
        this.selectedStatus = null
        this.selectedPaymentMethod = null

        this.subscriptionStateService.setState({
            plan: undefined,
            subscriptionType: undefined,
            status: undefined,
            page: 1, // Reset to first page
        })
    }

    @HostListener('document:click', ['$event'])
    onOutsideClick(event: MouseEvent) {
        const clickedInside = this.elementRef.nativeElement.contains(
            event.target,
        )
        if (!clickedInside) {
            this.closeFilter()
        }
    }
}
