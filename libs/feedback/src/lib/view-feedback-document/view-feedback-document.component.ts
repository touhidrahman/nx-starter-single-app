import { Component, inject } from '@angular/core'
import { IsImagePipe } from '@repo/common-pipes'
import { getFileIcon } from '@repo/common-util'
import { PrimeModules } from '@repo/prime-modules'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'lib-view-feedback',
    imports: [IsImagePipe, ...PrimeModules],
    templateUrl: './view-feedback-document.component.html',
    styleUrl: './view-feedback-document.component.scss',
})
export class ViewFeedbackDocumentComponent {
    ref: DynamicDialogRef | null = null
    config = inject(DynamicDialogConfig)

    documentFiles: string[] = this.config.data.files

    getFileIcon = getFileIcon

    openInNewTab(file: string): void {
        window.open(file, '_blank')
    }

    handleImageError(event: Event) {
        const imgElement = event.target as HTMLImageElement
        imgElement.src = 'assets/images/default-preview.png'
    }

    close() {
        this.ref?.close()
    }
}
