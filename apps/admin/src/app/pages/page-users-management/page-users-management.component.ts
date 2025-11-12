import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NoDataComponent, SearchInputComponent } from '@repo/common-components'
import { LabelValuePair } from '@repo/common-models'
import { PrimeModules } from '@repo/prime-modules'
import { SubscriptionStateService } from '@repo/subscription'
import {
    AdminUserFilterComponent,
    User,
    UserDeleteConfirmModalComponent,
    UserEditDialogueComponent,
    UserListStateService,
} from '@repo/user'
import { SortEvent } from 'primeng/api'
import { DialogService } from 'primeng/dynamicdialog'
import { TablePageEvent } from 'primeng/table'
import { USER_TABLE_COLUMN_HEADERS } from './user-col-status.data'

@Component({
    selector: 'app-page-users-management',
    imports: [
        CommonModule,
        ...PrimeModules,
        NoDataComponent,
        ReactiveFormsModule,
        FormsModule,
        AdminUserFilterComponent,
        SearchInputComponent,
    ],
    templateUrl: './page-users-management.component.html',
    styleUrl: './page-users-management.component.scss',
    providers: [SubscriptionStateService],
})
export class PageUsersManagementComponent implements OnInit {
    private dialogService = inject(DialogService)
    userListStateService = inject(UserListStateService)

    search = signal<string>('')
    isLoading = signal<boolean>(true)

    readonly cols = signal<LabelValuePair<string>[]>(USER_TABLE_COLUMN_HEADERS)

    readonly selectedColumns = signal<LabelValuePair<string>[]>(
        USER_TABLE_COLUMN_HEADERS,
    )
    readonly selectedFields = computed(() =>
        this.selectedColumns().map((c) => c.value),
    )

    ngOnInit(): void {
        this.userListStateService.init()
        this.selectColumnsByFields([
            'name',
            'username',
            'verified',
            'lastLogin',
            'status',
            'createdAt',
            'actions',
        ])
    }

    selectColumnsByFields(values: string[]): void {
        this.selectedColumns.set(
            this.cols().filter((col) => values.includes(col.value)),
        )
    }

    openUserDeleteModal(user: User) {
        const deleteRef = this.dialogService.open(
            UserDeleteConfirmModalComponent,
            {
                header: 'Delete User',
                width: '50%',
                breakpoints: {
                    '960px': '75vw',
                    '640px': '95vw',
                },
                modal: true,
                closable: true,
                data: user,
            },
        )

        deleteRef?.onClose.subscribe((res) => {
            if (res) {
                this.userListStateService.deleteUser(res.id)
            }
        })
    }

    openEditUserDialog(user: User) {
        const editRef = this.dialogService.open(UserEditDialogueComponent, {
            header: 'Edit User Information',
            width: '50%',
            breakpoints: {
                '960px': '75vw',
                '640px': '95vw',
            },
            modal: true,
            closable: true,
            data: user,
        })

        editRef?.onClose.subscribe((res) => {
            if (res) {
                this.userListStateService.replaceUser(res.data)
            }
        })
    }

    onSortChange(event: SortEvent) {
        this.userListStateService.setState({
            sortField: event.field as keyof User,
            sortDirection: event.order as -1 | 0 | 1,
            page: 1,
        })
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.userListStateService.setState({
            page: page,
            size: rows,
        })
    }

    onSearch(term: string) {
        this.search.set(term)
        this.userListStateService.setState({
            search: term,
            page: 1,
        })
    }

    onClearSearch() {
        this.search.set('')
        this.userListStateService.setState({
            search: '',
            page: 1,
        })
    }
}
