import { Component, input, output } from '@angular/core'

@Component({
    selector: 'lib-app-alert',
    template: `
        @if (show()) {
            <div
                class="border-l-green-400 bg-color-alert text-green mt-2 flex w-full items-start rounded-[5px] border-l-4 px-2 py-1.5  sm:items-center"
                role="alert">
                <div
                    class=" text-green-500 secondary-text-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg">
                    <i class="pi pi-info-circle text-sm "></i>
                    <span class="sr-only">Info icon</span>
                </div>
                <div class="ms-3 text-base font-normal text-green-800 secondary-text-2">
                    @if (title()) {
                        <span class="font-semibold">{{ title() }}</span>
                    }
                    {{ message() }}
                </div>
                @if (dismissible()) {
                    <button
                        (click)="onClose()"
                        type="button"
                        class="text-green-800 secondary-text-2 hover:text-green15b -mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 cursor-pointer"
                        aria-label="Close">
                        <span class="sr-only">Close</span>
                        <i class="pi pi-times text-base"></i>
                    </button>
                }
            </div>
        }
    `,
})
export class AlertComponent {
    show = input(true)
    message = input('')
    title = input<string | undefined>(undefined)
    dismissible = input(true)
    closed = output<void>()

    onClose() {
        this.closed.emit()
    }
}
