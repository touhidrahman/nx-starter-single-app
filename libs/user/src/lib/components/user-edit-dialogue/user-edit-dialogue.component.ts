import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { LabelValuePair } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { USER_STATUS_OPTIONS, USER_VERIFICATION_OPTIONS, User, UserStatus } from '../../user.model'
import { UserApiService } from '../../user-api.service'
import { UserFormService } from '../../user-form.service'
import { UserListStateService } from '../../user-list-state.service'

@Component({
    selector: 'app-user-edit-dialogue',
    imports: [ReactiveFormsModule, ...PrimeModules],
    templateUrl: './user-edit-dialogue.component.html',
    styleUrl: './user-edit-dialogue.component.css',
    providers: [UserFormService],
})
export class UserEditDialogueComponent implements OnInit {
    readonly config = inject(DynamicDialogConfig)
    private ref = inject(DynamicDialogRef)
    private alertService = inject(AlertService)
    private userApiService = inject(UserApiService)
    userListStateService = inject(UserListStateService)

    userFormService = inject(UserFormService)
    isLoading = signal<boolean>(false)

    statusOptions: LabelValuePair<UserStatus>[] = USER_STATUS_OPTIONS
    verificationOptions: LabelValuePair<boolean>[] = USER_VERIFICATION_OPTIONS

    ngOnInit(): void {
        if (this.config.data) {
            this.userFormService.patchForm(this.config.data)
        }
    }

    onSubmit() {
        this.isLoading.set(true)
        if (this.userFormService.form.invalid) {
            this.isLoading.set(false)
            return
        }

        const userInput = this.userFormService.getValue()
        this.updateUserStatus(this.config.data.id, userInput)
    }

    updateUserStatus(id: string, updatedData: User) {
        this.isLoading.set(true)
        this.userApiService.updateUserStatus(id, updatedData).subscribe({
            next: (_response) => {
                this.alertService.success('User status updated successfully')
                this.isLoading.set(false)
                this.ref?.close(_response)
            },
            error: (_err) => {
                this.alertService.error('Failed to update User status')
                this.isLoading.set(false)
                this.ref?.close(null)
            },
        })
    }
}
