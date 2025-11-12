/* eslint-disable @angular-eslint/component-selector */
import { Component, input } from '@angular/core'

@Component({
    selector: 'app-support-whatsapp',
    template: `
   <a
    href="{{supportUrl()}}"
    target="_blank"
    rel="noopener noreferrer"
    class=" gap-2 px-4 py-1 text-green-900 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 flex items-center"
    aria-label="Chat on WhatsApp">
    <i style="font-size: 1rem" class="pi pi-whatsapp text-green-500"></i>

        <h6 class="-ml-1 text-gray-600">Support:</h6>
        <p class=" font-medium">{{supportNumber() }}</p>

</a>
   `,
})
export class SupportWhatsappComponent {
    supportUrl = input('https://wa.me/8801341850281')
    supportNumber = input('01341850281')
}
