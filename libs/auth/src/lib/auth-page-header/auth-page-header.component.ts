import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { RouterModule } from '@angular/router'

@Component({
    selector: 'app-auth-page-header',
    imports: [CommonModule, RouterModule],
    template: `
   <div class="mb-2 text-center">
      <div
         class="bg-gradient-to-r from-green-500 via-emerald-500 to-green-800 bg-clip-text text-4xl font-extrabold text-transparent">
         {{ title() }}
      </div>
      <span class="text-gray-600">{{ subtitle() }}?</span>
      <a
         [routerLink]="[routerLink]"
         class="ml-1 cursor-pointer font-semibold text-green-500 transition-colors hover:text-green-600">
         {{ routerLinkText() }}
      </a>
   </div>
   `,
})
export class AuthPageHeaderComponent {
    title = input.required<string>()
    subtitle = input<string>()
    routerLink = input<string>()
    routerLinkText = input<string>()
}
