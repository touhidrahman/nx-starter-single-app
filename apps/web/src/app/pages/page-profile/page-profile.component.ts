import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { ChangePasswordFormService, GroupType } from '@repo/common-auth'
import { LoaderComponent } from '@repo/common-components'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import {
    ChangePasswordComponent,
    ProfileApiService,
    ProfileStateService,
    UpdateUser,
    UploadProfilePhotoComponent,
    User,
    UserFormService,
    UserProfileFormComponent,
} from '@repo/user'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-page-profile',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        PrimeModules,
        UserProfileFormComponent,
        ChangePasswordComponent,
        LoaderComponent,
    ],
    templateUrl: './page-profile.component.html',
    styleUrl: './page-profile.component.scss',
    providers: [ChangePasswordFormService, UserFormService, DialogService, DynamicDialogRef],
})
export class PageProfileComponent implements OnInit {
    private alertService = inject(AlertService)
    private dialogService = inject(DialogService)
    userFormService = inject(UserFormService)
    private profileApiService = inject(ProfileApiService)
    profileStateService = inject(ProfileStateService)
    authStateService = inject(AuthStateService)

    readonly groupType = GroupType

    isEditable = signal<boolean>(false)
    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)

    ngOnInit(): void {
        this.onLoadUser()
    }

    onEdit(isEdit: boolean) {
        if (isEdit) {
            this.isEditable.set(true)
            this.userFormService.form.enable()
        } else {
            this.userFormService.form.disable()
            this.isEditable.set(false)
        }
    }

    onLoadUser() {
        this.isLoading.set(true)
        this.authStateService.select('user').subscribe({
            next: (data) => {
                if (data) {
                    this.userFormService.form.disable()
                    const updateUser: UpdateUser = {
                        firstName: data.firstName ?? '',
                        lastName: data.lastName ?? '',
                        profilePhoto: data.profilePhoto ?? '',
                        city: data.city ?? '',
                        phone: data.phone ?? '',
                        state: data.state ?? '',
                        country: data.country ?? '',
                        postCode: data.postCode ?? '',
                        address: data.address ?? '',
                    }
                    this.userFormService.patchForm(updateUser)
                    this.isLoading.set(false)
                }
            },
        })
    }

    onUpdateProfile(event: Event) {
        this.isLoading.set(true)
        event.preventDefault()
        const updateUser: UpdateUser = this.userFormService.getValue()
        this.profileApiService.updateProfile(updateUser).subscribe({
            next: (res: ApiResponse<User>) => {
                if (res.data) {
                    this.isLoading.set(false)
                    this.userFormService.patchForm(res.data)
                    this.userFormService.form.disable()
                    this.authStateService.setState({ user: res.data })
                    this.isEditable.set(false)
                    this.alertService.success('Profile updated successfully')
                }
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('Failed to update profile')
            },
        })
    }

    deleteProfilePic() {
        //     TODO: delete profile pic
    }

    showUploadProfilePhoto() {
        const ref = this.dialogService.open(UploadProfilePhotoComponent, {
            header: 'Upload Profile Photo',
            width: '50vw',
            modal: true,
            closable: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
        })
    }
}
