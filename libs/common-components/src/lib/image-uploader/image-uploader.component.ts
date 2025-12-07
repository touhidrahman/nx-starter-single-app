/* eslint-disable @angular-eslint/component-selector */

import { CommonModule } from '@angular/common'
import { Component, computed, inject, input, output, signal } from '@angular/core'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Lawyer } from '@repo/lawyer'
import { FileSelectEvent } from 'primeng/fileupload'

@Component({
    selector: 'app-image-uploader',
    imports: [CommonModule, PrimeModules],
    templateUrl: './image-uploader.component.html',
    styleUrl: './image-uploader.component.css',
    providers: [],
})
export class ImageUploaderComponent {
    private alertService = inject(AlertService)
    previewImageUrl = input.required<string>()
    localImageUrl = signal<string>('')
    buttonLabel = input.required<string>()
    lawyer = input<Lawyer | null>(null)
    uploadLabel = input.required<string>()
    noImageText = input('No image selected')
    isLoading = input(false)
    accept = input('image/*')
    showUploadButton = input(true)
    avatarDimensions = input('h-66 w-56')
    selectAnotherLabel = input('Select Another Image')

    fileSelected = output<File>()
    uploadClicked = output<File>()
    imageCleared = output<void>()

    selectedFile = signal<File | null>(null)
    readonly displayImageUrl = computed(() => this.localImageUrl() || this.previewImageUrl())

    onFileSelect(event: FileSelectEvent) {
        if (event.files && event.files.length > 0) {
            this.selectedFile.set(event.files[0])
            this.fileSelected.emit(event.files[0])
            const reader = new FileReader()
            reader.onload = () => {
                this.localImageUrl.set(reader.result as string)
            }
            reader.readAsDataURL(event.files[0])
        }
    }

    onUploadClick() {
        const file = this.selectedFile()
        if (!file) {
            this.alertService.error('Please select an image first')
            return
        }
        this.uploadClicked.emit(file)
    }

    clearImage() {
        this.selectedFile.set(null)
        this.localImageUrl.set('')
        this.imageCleared.emit()
    }
}
