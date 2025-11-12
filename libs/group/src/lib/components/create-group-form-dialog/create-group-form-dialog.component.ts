import { Component, inject, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { GroupType } from '@repo/common-auth'
import { PrimeModules } from '@repo/prime-modules'
import { GroupApiService, GroupFormService } from '@repo/group'
import { DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-create-group-form-dialog',
    imports: [FormsModule, ReactiveFormsModule, PrimeModules],
    templateUrl: './create-group-form-dialog.component.html',
    styleUrl: './create-group-form-dialog.component.scss',
    providers: [GroupFormService],
})
export class CreateGroupFormDialogComponent {
    groupFormService = inject(GroupFormService)
    groupApiService = inject(GroupApiService)
    isLoading = signal<boolean>(false)
    ref: DynamicDialogRef | undefined
    type = Object.values(GroupType)

    onSubmit(event: Event) {
        event.preventDefault()
        if (this.groupFormService.form.invalid) {
            return
        }
        const data = this.groupFormService.form.getRawValue()
        this.isLoading.set(true)
        this.groupApiService.create(data).subscribe({
            next: ({ data }) => {
                if (!data) {
                    this.isLoading.set(false)
                    return
                }
                this.groupFormService.form.reset()
                this.ref?.close(data)
                this.isLoading.set(false)
            },
            error: () => {
                this.ref?.close()
                this.isLoading.set(false)
            },
        })
    }
}
