import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { UserSettingsApiService } from '@repo/user-setting'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-set-pin-dialog',
    imports: [...PrimeModules, CommonModule, FormsModule],
    templateUrl: './set-pin-dialog.component.html',
    styleUrl: './set-pin-dialog.component.css',
})
export class SetPinDialogComponent {
    private userSettingsApiService = inject(UserSettingsApiService)
    private config = inject(DynamicDialogConfig)
    private alertService = inject(AlertService)
    private ref = inject(DynamicDialogRef)

    value = signal<string>('')
    userId = signal<string>(this.config.data.userId ?? '')

    setPin() {
        this.userSettingsApiService
            .updateUserSetting(this.userId(), { pinCode: this.value() })
            .subscribe({
                next: ({ data }) => {
                    const settings = Object.assign({}, ...Object.values(data))
                    this.ref?.close(settings.value)
                },
                error: (err) => {
                    this.alertService.error(err.message)
                },
            })
    }
}
