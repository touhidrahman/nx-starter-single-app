import { Component, Input } from '@angular/core'

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Component({
    selector: 'app-video-popup',
    imports: [],
    templateUrl: './video-popup.component.html',
    styleUrl: './video-popup.component.scss',
})
export class VideoPopupComponent {
    @Input() videoId = ''
    @Input() startSeconds?: number
    @Input() buttonText = 'How to create an account?'
    @Input() buttonSubText = 'Watch'

    showVideoPopup = false
    sanitizedVideoUrl!: SafeResourceUrl

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {
        let url = `https://www.youtube.com/embed/${this.videoId}`
        if (this.startSeconds) {
            url += `?start=${this.startSeconds}&autoplay=1`
        }
        this.sanitizedVideoUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(url)
    }
}
