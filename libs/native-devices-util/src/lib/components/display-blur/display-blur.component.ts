import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AuthApiService } from '@repo/common-auth'
import { PrimeModules } from '@repo/prime-modules'
import { UserSettingsApiService } from '@repo/user-setting'
import { DialogService } from 'primeng/dynamicdialog'
import { DisplayIdleService } from '../../display-idle.service'

@Component({
    selector: 'lib-display-blur',
    standalone: true,
    imports: [FormsModule, ...PrimeModules],
    templateUrl: './display-blur.component.html',
    styleUrls: ['./display-blur.component.css'],
    providers: [DialogService],
})
export class DisplayBlurComponent implements OnInit {
    displayIdleService = inject(DisplayIdleService)
    dialogService = inject(DialogService)
    private userSettingsApiService = inject(UserSettingsApiService)
    private authApiService = inject(AuthApiService)

    pin = signal<string>('')
    showMethod = signal<boolean>(false)
    method = signal<string>('')
    errMessage = signal<string>('')
    loading = signal<boolean>(false)
    pinMatchedMessage = signal<string>('')

    ngOnInit() {
        this.showMethod.set(false)
    }

    onVerifyPin() {
        this.loading.set(true)
        this.authApiService.verifyPinCode(this.pin()).subscribe({
            next: ({ data }) => {
                if (data.verified) {
                    this.pin.set('')
                    this.loading.set(false)
                    this.displayIdleService.unlock()
                }
            },
            error: (err) => {
                this.pin.set('')
                this.loading.set(false)
                this.pinMatchedMessage.set(err.error.message)
            },
        })
    }

    forgotPin() {
        this.showMethod.set(true)
    }

    sendCode() {
        this.loading.set(true)
        this.authApiService.forgotPIN(this.method()).subscribe({
            next: (res) => {
                this.loading.set(false)
                this.showMethod.set(false)
            },
            error: (err) => {
                this.loading.set(false)
                this.errMessage.set(err.error.message || 'Something went wrong')
            },
        })
    }

    cancel() {
        this.showMethod.set(false)
    }
}
