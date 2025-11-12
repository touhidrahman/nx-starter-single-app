import { Injectable, inject } from '@angular/core'
import { SimpleStore } from '@repo/store'
import { UserSettingsApiService } from './user-setting.api.service'

interface UserSettingState {
    settings: {
        pinCode: string
        isPinEnabled: string
    }
    isPinCodeSet: boolean
    loading: boolean
    error: boolean
}

const initialState: UserSettingState = {
    settings: {
        pinCode: '',
        isPinEnabled: '',
    },
    isPinCodeSet: false,
    loading: false,
    error: false,
}

@Injectable({
    providedIn: 'root',
})
export class UserSettingStateService extends SimpleStore<UserSettingState> {
    userSettingsApiService = inject(UserSettingsApiService)

    constructor() {
        super(initialState)
        this.init()
    }

    init() {
        this.continueLoadingUserSettings()
    }

    private continueLoadingUserSettings() {
        this.userSettingsApiService.getUsersSettingsByUserId().subscribe({
            next: ({ data }) => {
                this.setState({
                    loading: false,
                    settings: {
                        pinCode: data.settings['pinCode'],
                        isPinEnabled: data.settings['isPinEnabled'],
                    },
                    isPinCodeSet: data.settings['pinCode'] ? true : false,
                    error: false,
                })
            },
            error: (_err) => {
                this.setState({ loading: false, error: true })
            },
        })
    }

    setSettings(partialSettings: Partial<UserSettingState['settings']>) {
        const current = this.getState()
        this.setState({
            ...current,
            settings: {
                ...current.settings,
                ...partialSettings,
            },
            isPinCodeSet: !!(
                partialSettings.pinCode ?? current.settings.pinCode
            ),
        })
    }

    isSetPIN() {
        return this.getState().isPinCodeSet
    }
}
