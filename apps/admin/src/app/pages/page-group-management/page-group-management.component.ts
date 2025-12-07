import { AsyncPipe, CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { Group, GroupStatus } from '@repo/common-auth'
import { SearchInputComponent } from '@repo/common-components'
import { LabelValuePair, OrderBy } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import {
    CreateGroupFormDialogComponent,
    DeleteGroupModalComponent,
    GroupApiService,
    GroupFilterComponent,
    GroupListStateService,
} from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { SortEvent } from 'primeng/api'
import { DialogService } from 'primeng/dynamicdialog'
import { TablePageEvent } from 'primeng/table'

@Component({
    selector: 'app-page-group-management',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TitleCasePipe,
        UpperCasePipe,
        ...PrimeModules,
        AsyncPipe,
        FormsModule,
        GroupFilterComponent,
        SearchInputComponent,
    ],
    templateUrl: './page-group-management.component.html',
    styleUrl: './page-group-management.component.css',
})
export class PageGroupManagementComponent implements OnInit {
    private groupApiService = inject(GroupApiService)
    private router = inject(Router)
    private dialogService = inject(DialogService)
    private alertService = inject(AlertService)
    protected groupListStateService = inject(GroupListStateService)

    GROUP_TABLE_COLUMN_HEADERS: LabelValuePair<string>[] = [
        { value: 'id', label: 'Group Id' },
        { value: 'ownerName', label: 'Owner Name' },
        { value: 'ownerUsername', label: 'Owner User Name' },
        { value: 'name', label: 'Group Name' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone ' },
        { value: 'address', label: 'Address' },
        { value: 'type', label: 'Group Type' },
        { value: 'verified', label: 'Verified' },
        { value: 'status', label: 'Status' },
        { value: 'createdAt', label: 'Joined' },
        { value: 'verifiedOn', label: 'Verified On' },
        { value: 'actions', label: 'Actions' },
    ]

    visible = signal<boolean>(false)
    groupStatus = Object.values(GroupStatus)
    selectedValue = signal<GroupStatus | null>(null)
    selectedId = signal<string | null>(null)
    statusSeverityMap: Record<
        string,
        | 'success'
        | 'secondary'
        | 'info'
        | 'warn'
        | 'danger'
        | 'help'
        | 'primary'
        | 'contrast'
        | null
        | undefined
    > = {
        active: 'success',
        inactive: 'contrast',
        pending: 'info',
    }
    search = signal<string>('')

    readonly groupTableHeaders = signal<LabelValuePair<string>[]>(this.GROUP_TABLE_COLUMN_HEADERS)

    readonly selectedColumns = signal<LabelValuePair<string>[]>(this.GROUP_TABLE_COLUMN_HEADERS)

    readonly selectedFields = computed(() => this.selectedColumns().map((c) => c.value))

    ngOnInit(): void {
        this.groupListStateService.init()
        this.selectColumnsByFields([
            'id',
            'ownerUsername',
            'ownerName',
            'name',
            'createdAt',
            'status',
            'type',
            'actions',
        ])
    }

    selectColumnsByFields(values: string[]): void {
        this.selectedColumns.set(
            this.groupTableHeaders().filter((col) => values.includes(col.value)),
        )
    }

    openGroupDialog() {
        const ref = this.dialogService.open(CreateGroupFormDialogComponent, {
            header: 'Create Group',
            width: '50vw',
            modal: true,
            dismissableMask: false,
            closable: true,
            style: { overflow: 'auto', padding: '1rem' },
        })

        ref?.onClose.subscribe({
            next: (res) => {
                if (!res) return
                this.groupListStateService.pushGroup(res)
            },
            error: (err) => {
                console.error('Error in onClose create group:', err)
            },
        })
    }

    onSearch(term: string) {
        this.search.set(term)
        this.groupListStateService.setState({
            search: term,
            page: 1,
        })
    }

    onClearSearch() {
        this.search.set('')
        this.groupListStateService.setState({
            search: '',
            page: 1,
        })
    }

    get sortOrderNumber(): number {
        return this.groupListStateService.getState().orderBy === OrderBy.Asc ? 1 : -1
    }

    onSortByOrder(event: SortEvent) {
        this.groupListStateService.setState({
            orderBy: event.order === 1 ? OrderBy.Asc : OrderBy.Desc,
            page: 1,
        })
    }

    viewGroupDetails(group: Group) {
        this.router.navigate([`/group/${group.id}`])
    }

    updateStatusDialog(id: string, status: GroupStatus) {
        this.visible.set(!this.visible())
        this.selectedId.set(id)
        this.selectedValue.set(status)
    }

    updateStatus() {
        this.groupApiService
            .updateGroupStatus(this.selectedId() ?? '', this.selectedValue() ?? GroupStatus.pending)
            .subscribe({
                next: (res) => {
                    if (res.data) {
                        this.visible.set(false)
                        this.alertService.success('Group status updated successfully.')
                        this.groupListStateService.replaceGroup(res.data)
                    }
                },
                error: (err) => {
                    this.visible.set(false)
                    this.alertService.error(err.error.message)
                },
            })
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.groupListStateService.setState({
            page: page,
            size: rows,
        })
    }

    openGroupDeleteDialog() {
        this.dialogService.open(DeleteGroupModalComponent, {
            header: 'Delete Group',
            width: '50vw',
            modal: true,
            dismissableMask: false,
            closable: true,
            style: { overflow: 'auto', padding: '1rem' },
        })
    }
}
