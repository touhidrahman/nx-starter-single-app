import { Component, inject, input, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { AuthApiService, ChangePasswordFormService } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-change-password',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss',
    providers: [ChangePasswordFormService],
})
export class ChangePasswordComponent {
    private authApiService = inject(AuthApiService)
    private alertService = inject(AlertService)
    changePasswordFormService = inject(ChangePasswordFormService)

    userId = input<string>('')

    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)

    onSubmit(event: Event) {
        this.isLoading.set(true)
        event.preventDefault()
        if (this.changePasswordFormService.form.invalid) {
            return
        }
        const { currentPassword, password } = this.changePasswordFormService.getValue()

        this.authApiService.changePassword(this.userId(), currentPassword, password).subscribe({
            next: (res: ApiResponse<boolean>) => {
                if (res.data) {
                    this.alertService.success('password changed successfully')
                    this.isLoading.set(false)
                    this.changePasswordFormService.form.reset()
                }
            },
            error: () => {
                this.alertService.error('password change failed')
                this.isLoading.set(false)
            },
        })
    }
}
