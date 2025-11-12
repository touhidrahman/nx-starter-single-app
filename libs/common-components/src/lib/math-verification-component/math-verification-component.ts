/* eslint-disable @angular-eslint/component-selector */
// math-verification.component.ts

import { CommonModule } from '@angular/common'
import { Component, computed, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-math-verification',
    imports: [CommonModule, FormsModule, PrimeModules],
    template: `
    <div class="flex items-center justify-start gap-4">
      <p class="rotate-45 text-4xl font-thin">{{ number1() }}</p>
      <i class="pi pi-plus" style="font-size: 1rem"></i>
      <p class="-rotate-32 text-4xl font-thin">{{ number2() }}</p>
      <i class="pi pi-equals" style="font-size: 1.5rem"></i>
      <input
        pInputText
        class="w-2/6 sm:w-1/6 text-base"
        (input)="onInput($event)"
        [placeholder]="placeholder"
      />
      @if (isVerified()) {
        <i
          class="pi pi-check"
          style="font-size: 1rem; font-weight: bold; color: forestgreen"
        ></i>
      }
    </div>
  `,
})
export class MathVerificationComponent {
    number1 = signal<number>(Math.floor(Math.random() * 10))
    number2 = signal<number>(Math.floor(Math.random() * 10))
    userInput = signal<number>(0)
    placeholder = 'Enter sum'

    verified = output<boolean>()

    sum = computed(() => this.number1() + this.number2())
    isVerified = computed(() => this.userInput() === this.sum())

    constructor() {
        this.generateNewProblem()
    }

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.userInput.set(Number(value) || 0)
        this.verified.emit(this.isVerified())
    }

    private generateNewProblem() {
        this.number1.set(Math.floor(Math.random() * 10))
        this.number2.set(Math.floor(Math.random() * 10))
        this.userInput.set(0)
    }
}
