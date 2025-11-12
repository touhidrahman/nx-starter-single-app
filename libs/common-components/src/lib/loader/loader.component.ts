import { Component, input } from '@angular/core'

@Component({
    selector: 'lib-app-loader',
    template: `
        <div class="flex min-h-32 items-center justify-center">
            <div
                class="mb-4 flex w-full max-w-[200px] items-center rounded-lg border-gray border border-gray-300 bg-white bg-color-container px-3 py-2 text-gray-500 shadow-sm"
                role="alert">
                <div
                    class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 bg-gray-white-400 p-3 text-purple-500 secondary-text">
                    <i
                        class="pi pi-spin pi-spinner"
                        style="font-size: 1rem"></i>
                </div>
                <div class="ms-3 text-sm font-normal secondary-text">
                    {{ loadingMessage() }}
                </div>
                <div></div>
            </div>
        </div>
    `,
})
export class LoaderComponent {
    loadingMessage = input<string>('')
}
