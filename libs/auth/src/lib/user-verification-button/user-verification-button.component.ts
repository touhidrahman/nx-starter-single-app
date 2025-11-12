import { CommonModule } from '@angular/common'
import { Component, input, output } from '@angular/core'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-user-verification-button',
    imports: [CommonModule, PrimeModules],
    template: `
    @if (shouldShowVerifyButton()) {
       <span class="bg-green-50 text-green-700 text-sm font-medium  px-2.5 py-0.5 rounded-sm inline-block leading-3">
             We found your account, but your  {{isEmail()? 'email address': 'phone number'}} hasn't been verified yet. Please <p-button
             styleClass="text-green-800 px-[.25rem] underline"
             label="Verify"
             variant="text"
             [disabled]="isLoading()"
             (onClick)="onVerify()"
             severity="success"
             size="small" />it to continue

       </span>
      }
   `,
})
export class UserVerificationButtonComponent {
    shouldShowVerifyButton = input.required<boolean>()
    isLoading = input.required<boolean>()
    isEmail = input.required<any>()
    userVerify = output<void>()

    onVerify() {
        this.userVerify.emit()
    }
}
