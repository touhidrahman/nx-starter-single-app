import { Component, inject } from '@angular/core'
import { AuthStateService } from '@repo/auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogRef } from 'primeng/dynamicdialog'
import { FileSelectEvent } from 'primeng/fileupload'
import { ProfileApiService } from '../../profile-api.service'
import { ProfileStateService } from '../../profile-state.service'

@Component({
    selector: 'app-upload-profile-photo',
    imports: [PrimeModules],
    templateUrl: './upload-profile-photo.component.html',
    styleUrl: './upload-profile-photo.component.scss',
})
export class UploadProfilePhotoComponent {
    alertService = inject(AlertService)
    authStateService = inject(AuthStateService)
    profileStateService = inject(ProfileStateService)
    profileApiService = inject(ProfileApiService)
    private ref = inject(DynamicDialogRef)

    selectedFile: File | null = null
    previewUrl: string | null = null
    isLoading = false

    ngOnInit() {
        this.profileStateService.init()
    }

    onFileSelect(event: FileSelectEvent) {
        this.selectedFile = event.files[0]

        const reader = new FileReader()
        reader.onload = () => {
            this.previewUrl = reader.result as string
        }
        reader.readAsDataURL(this.selectedFile)
    }

    uploadAndSetProfilePicture() {
        if (!this.selectedFile) {
            this.alertService.error('Please select an image first')
            return
        }

        this.isLoading = true
        this.profileApiService.uploadProfilePic(this.selectedFile).subscribe({
            next: ({ data }: any) => {
                if (data.profilePhoto) {
                    this.updateProfilePhoto(data.profilePhoto)
                } else {
                    this.updateProfilePhoto(this.previewUrl as string)
                }
            },
            error: (err) => {
                this.isLoading = false
                this.alertService.error(err.error?.message || 'Failed to upload profile photo')
            },
        })
    }

    private updateProfilePhoto(url: string) {
        this.profileApiService.updateProfile({ profilePhoto: url }).subscribe({
            next: () => {
                this.profileStateService.setProfilePhotoUrl(url)
                this.alertService.success('Profile picture updated successfully')
                this.ref?.close()
            },
            error: (err) => {
                this.alertService.error(err.error?.message || 'Failed to set profile photo')
            },
            complete: () => {
                this.isLoading = false
            },
        })
    }
}
