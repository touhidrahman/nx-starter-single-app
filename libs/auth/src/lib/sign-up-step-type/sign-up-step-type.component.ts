import { NgClass, NgFor, NgIf } from '@angular/common'
import { Component, inject, input, output } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { RegisterFormService } from '@repo/common-auth'
import { PrimeModules } from '@repo/prime-modules'
import { ButtonModule } from 'primeng/button'

@Component({
    selector: 'app-signup-step-type',
    imports: [ReactiveFormsModule, PrimeModules, NgClass],
    templateUrl: './sign-up-step-type.component.html',
})
export class SignupStepTypeComponent {
    registerFormService = inject(RegisterFormService)
    signUpForm = input.required<FormGroup>()
    groupTypes = input.required<any[]>()
    next = output<void>()
    register = output<void>()

    selectGroupType(type: string) {
        this.registerFormService.form.get('organization.groupType')?.setValue(type)
    }
}
