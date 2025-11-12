import {
    Component,
    ElementRef,
    HostListener,
    inject,
    signal,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GroupStatus, GroupType } from '@repo/common-auth'
import { LabelValuePair } from '@repo/common-models'
import { PrimeModules } from '@repo/prime-modules'
import { GroupListState, GroupListStateService } from '@repo/group'

@Component({
    selector: 'app-group-filter',
    imports: [PrimeModules, FormsModule],
    templateUrl: './group-filter.component.html',
    styleUrl: './group-filter.component.scss',
})
export class GroupFilterComponent {
    groupListStateService = inject(GroupListStateService)
    elementRef = inject(ElementRef)

    showFilter = signal(false)

    // Filter properties
    selectedStatus: GroupStatus | null = null
    selectedType: GroupType | null = null

    // Options for dropdowns
    statusOptions: LabelValuePair<GroupStatus>[] = [
        { label: 'Active', value: GroupStatus.active },
        { label: 'Inactive', value: GroupStatus.inactive },
        { label: 'Pending', value: GroupStatus.pending },
    ]

    typeOptions: LabelValuePair<GroupType>[] = [
        { label: 'Vendor', value: GroupType.vendor },
        { label: 'Client', value: GroupType.client },
    ]

    ngOnInit() {
        const currentState = this.groupListStateService.getState()
        this.selectedStatus =
            currentState.status &&
            Object.values(GroupStatus).includes(
                currentState.status as GroupStatus,
            )
                ? (currentState.status as GroupStatus)
                : null
        this.selectedType =
            currentState.type &&
            Object.values(GroupType).includes(currentState.type as GroupType)
                ? (currentState.type as GroupType)
                : null
    }

    closeFilter() {
        this.showFilter.set(false)
    }

    applyFilters() {
        const filters: Partial<GroupListState> = {
            status: this.selectedStatus || undefined,
            type: this.selectedType || undefined,
            page: 1, // Reset to first page when applying new filters
        }

        this.groupListStateService.setState(filters)
        this.closeFilter()
    }

    resetFilter() {
        this.selectedStatus = null
        this.selectedType = null

        this.groupListStateService.setState({
            status: undefined,
            type: undefined,
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
