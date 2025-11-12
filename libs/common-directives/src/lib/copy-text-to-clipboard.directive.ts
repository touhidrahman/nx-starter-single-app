import { Directive, HostListener, Input, inject } from '@angular/core'
import { AlertService } from '@repo/common-services'

@Directive({
    selector: '[appCopyToClipboard]',
    standalone: true,
})
export class CopyToClipboardDirective {
    private alertService = inject(AlertService)

    @Input('appCopyToClipboard') copyText: string | undefined

    @HostListener('click')
    async handleClick() {
        if (!this.copyText?.trim()) {
            this.alertService.error('Nothing to copy')
            return
        }

        try {
            await navigator.clipboard.writeText(this.copyText)
            this.alertService.success('Copied!')
        } catch (err) {
            console.error('Clipboard copy failed:', err)
            this.alertService.error('Copy failed')
        }
    }
}
