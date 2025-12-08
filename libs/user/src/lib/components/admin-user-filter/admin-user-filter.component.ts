import { CommonModule } from '@angular/common'
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { LabelValuePair } from '@repo/common-models'
import { PrimeModules } from '@repo/prime-modules'
import { UserListStateService, UserStatus } from '@repo/user'

@Component({
    selector: 'app-admin-user-filter',
    imports: [CommonModule, PrimeModules, FormsModule],
    templateUrl: './admin-user-filter.component.html',
    styleUrl: './admin-user-filter.component.css',
})
export class AdminUserFilterComponent {
    private userListStateService = inject(UserListStateService)
    private elementRef = inject(ElementRef)

    showFilter = signal(false)

    // Filter property
    selectedStatus: UserStatus | null = null

    // Options for dropdown
    statusOptions: LabelValuePair<UserStatus>[] = [
        { label: 'Active', value: UserStatus.ACTIVE },
        { label: 'Inactive', value: UserStatus.INACTIVE },
        { label: 'Banned', value: UserStatus.BANNED },
    ]

    ngOnInit() {
        const currentState = this.userListStateService.getState()
        // Initialize selectedStatus from current state if available
        if (currentState.searchField?.['status']) {
            this.selectedStatus = currentState.searchField['status'] as UserStatus
        }
    }

    closeFilter() {
        this.showFilter.set(false)
    }

    applyFilters() {
        const filters = {
            searchField: this.selectedStatus ? { status: this.selectedStatus } : null,
            page: 1, // Reset to first page when applying new filters
        }

        this.userListStateService.setState(filters)
        this.closeFilter()
    }

    resetFilter() {
        this.selectedStatus = null
        this.userListStateService.setState({
            searchField: null,
            page: 1, // Reset to first page
        })
    }

    @HostListener('document:click', ['$event'])
    onOutsideClick(event: MouseEvent) {
        const clickedInside = this.elementRef.nativeElement.contains(event.target)
        if (!clickedInside) {
            this.closeFilter()
        }
    }
}
