import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { Group, GroupInput } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { GroupApiService, GroupFormService, GroupStateService } from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-edit-group-form',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './edit-group-form.component.html',
    styleUrl: './edit-group-form.component.scss',
    providers: [GroupFormService, DynamicDialogRef],
})
export class EditGroupFormComponent implements OnInit {
    groupFormService = inject(GroupFormService)
    groupStateService = inject(GroupStateService)
    groupApiService = inject(GroupApiService)
    alertService = inject(AlertService)
    isLoading = signal(false)

    id = input<string>()
    editMode = input<boolean>()

    @Output() editModeChange = new EventEmitter<boolean>()
    @Output() groupUpdated = new EventEmitter<Group>()

    ngOnInit() {}

    onSubmit(event: Event) {
        event?.preventDefault()
        if (this.groupFormService.form.invalid) {
            this.alertService.error('Please fill all required fields.')
            return
        }

        this.isLoading.set(true)
        const formValue = this.groupFormService.getValue()
        const group: GroupInput = {
            ...formValue,
        }

        this.updateGroup(this.id()!, group)
    }

    private updateGroup(id: string, group: GroupInput) {
        this.groupApiService.update(id, group).subscribe({
            next: (res) => {
                if (!res.data) {
                    this.isLoading.set(false)
                    this.alertService.error('Failed to update Group.')
                    return
                }

                if (res.data) {
                    this.isLoading.set(false)
                    this.alertService.success('Group updated successfully.')
                    this.editModeChange.emit(false)
                }
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('Failed to update Group.')
            },
        })
    }
}
