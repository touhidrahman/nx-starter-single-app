import { Component, inject, input, signal } from '@angular/core'
import { Group } from '@repo/common-auth'
import {
    EditGroupFormComponent,
    GroupDeleteConfirmModalComponent,
    GroupDetailsCardComponent,
    GroupFormService,
    GroupStateService,
    GroupSubscriptionComponent,
} from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { DialogService } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-group-info',
    imports: [
        GroupDetailsCardComponent,
        GroupSubscriptionComponent,
        EditGroupFormComponent,
        PrimeModules,
    ],
    templateUrl: './group-details.component.html',
    styleUrl: './group-details.component.css',
})
export class GroupDetailsComponent {
    private dialogService = inject(DialogService)

    protected groupStateService = inject(GroupStateService)
    protected groupFormService = inject(GroupFormService)

    groupId = input.required<string>()

    editMode = signal<boolean>(false)
    selectedGroup = signal<Group | null>(null)
    loading = signal<boolean>(false)

    ngOnInit(): void {
        this.groupStateService.setState({ groupId: this.groupId() })
        this.getGroupData()
    }

    getGroupData() {
        this.groupStateService.select('group').subscribe({
            next: (data) => {
                if (data) {
                    this.selectedGroup.set(data)
                    this.groupFormService.form.patchValue(data)
                }
            },
        })
    }

    openGroupDeleteModal(group: Group) {
        const deleteRef = this.dialogService.open(
            GroupDeleteConfirmModalComponent,
            {
                header: 'Delete Group',
                width: '50%',
                breakpoints: {
                    '960px': '75vw',
                    '640px': '95vw',
                },
                modal: true,
                closable: true,
                data: group,
            },
        )

        deleteRef?.onClose.subscribe((res) => {
            if (res) {
                this.groupStateService.deleteGroup(res.id)
            }
        })
    }
}
