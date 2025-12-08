import { AsyncPipe } from '@angular/common'
import { Component, inject, OnDestroy, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AuthStateService } from '@repo/auth'
import { AuthApiService } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { UserSettingStateService, UserSettingsApiService } from '@repo/user-setting'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { SetPinDialogComponent } from '../set-pin-dialog/set-pin-dialog.component'

@Component({
    selector: 'app-generate-pin',
    imports: [...PrimeModules, AsyncPipe, FormsModule],
    templateUrl: './generate-pin.component.html',
    styleUrl: './generate-pin.component.css',
    providers: [DialogService, DynamicDialogRef],
})
export class GeneratePinComponent implements OnDestroy {
    private authStateService = inject(AuthStateService)
    private alertService = inject(AlertService)
    protected userSettingStateService = inject(UserSettingStateService)
    protected userSettingsApiService = inject(UserSettingsApiService)
    protected authApiService = inject(AuthApiService)
    private dialogService = inject(DialogService)
    private ref = inject(DynamicDialogRef)

    userId = signal<string>(this.authStateService.getUserId() ?? '')

    onSetNewPin() {
        const ref = this.dialogService.open(SetPinDialogComponent, {
            header: '',
            closable: true,
            width: '30vw',
            modal: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
            },
            data: { userId: this.userId() },
        })

        ref?.onClose.subscribe({
            next: (data) => {
                if (data) {
                    this.userSettingStateService.setSettings({ pinCode: data })
                    this.alertService.success('PIN added added successfully.')
                }
            },
        })
    }

    ngOnDestroy() {
        if (this.ref) {
            this.ref?.close()
        }
    }

    onEnablePin() {
        this.authApiService.enablePin().subscribe({
            next: ({ data, message }) => {
                if (data) {
                    const settings = Object.assign({}, ...Object.values(data))
                    this.userSettingStateService.setSettings({
                        isPinEnabled: settings.isPinEnabled,
                    })
                    this.alertService.info(message ?? 'Enabled pin')
                }
            },
        })
    }
}
