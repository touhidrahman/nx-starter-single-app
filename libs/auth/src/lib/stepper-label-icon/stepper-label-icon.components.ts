import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-stepper-label-icon',
    imports: [CommonModule, PrimeModules],
    template: `
   <p-button styleClass="bg-transparent border-none flex flex-col gap-2 items-center focus:ring-0 shadow-none" [text]="true">
      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all"
            [ngClass]="{
              'border-green-600 bg-green-500 text-white': value() <= activeStep(),
              'border-gray-300 text-gray-400': value() > activeStep()
            }">
        <i [class]="icon()"></i>
      </span>
      <span class="text-xs font-semibold text-gray-700">{{ label() }}</span>
    </p-button>
   `,
})
export class StepperLabelIconComponent {
    value = input.required<number>()
    activeStep = input.required<number>()
    label = input.required<string>()
    icon = input.required<string>()
}
