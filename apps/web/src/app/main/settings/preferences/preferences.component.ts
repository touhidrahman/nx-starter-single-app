import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { Group } from '@repo/common-auth'
import { AlertService, ConfirmDialogData, ThemeService } from '@repo/common-services'
import { GroupApiService } from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'
import { SubscriptionStateService } from '@repo/subscription'
import { UserSettingsApiService } from '@repo/user-setting'
import { differenceInDays } from 'date-fns'

@Component({
    selector: 'app-preferences',
    imports: [PrimeModules, FormsModule, RouterModule],
    templateUrl: './preferences.component.html',
    styleUrl: './preferences.component.scss',
    providers: [SubscriptionStateService],
})
export class PreferencesComponent {
    private authStateService = inject(AuthStateService)
    private subscriptionStateService = inject(SubscriptionStateService)
    private userSettingsApiService = inject(UserSettingsApiService)
    private organizationApiService = inject(GroupApiService)
    private alertService = inject(AlertService)
    private themeService = inject(ThemeService)
    organization = signal<Group | null>(null)
    themeChecked = false
    languageChecked = false
    autoRenewchecked = false
    id = signal<string>('')
    userId = signal<string>('')
    toggleId = 'dark-toggle'

    ngOnInit(): void {
        const id = this.authStateService.getGroupId() ?? ''
        const userId = this.authStateService.getUserId() ?? ''
        this.id.set(id)
        this.userId.set(userId)
        this.getOrganization(id)
        this.subscriptionStateService.getSubscriptionByGroupId(id)
        this.getUserSetting()
        this.themeChecked = this.themeService.isDark
    }

    getRenewDate(endDate?: Date | string): Date | null {
        if (!endDate) return null
        const date = new Date(endDate)
        date.setDate(date.getDate() + 1)
        return date
    }

    getRemainingDay(endDate?: Date | string): number | null {
        if (!endDate) return null

        const today = new Date()
        const lastDate = new Date(endDate)
        const diffDays = differenceInDays(lastDate, today)
        return diffDays > 0 ? diffDays : 0
    }

    confirmCancel(event: Event) {
        const confirmDialogData: ConfirmDialogData = {
            event,
            title: 'Cancel Plan',
            message: 'Are you sure you want to cancel?',
            confirmAction: () => {},
        }
        this.alertService.confirm(confirmDialogData)
    }

    onThemeChange() {
        this.themeService.setTheme(this.themeChecked)

        const theme = this.themeChecked ? 'dark' : 'light'
        this.userSettingsApiService.updateUserSetting(this.userId(), { theme }).subscribe()
    }

    onLanguageChange() {
        const language = this.languageChecked ? 'bn' : 'en'
        this.userSettingsApiService.updateUserSetting(this.userId(), { language }).subscribe({
            next: (res) => {},
            error: (err) => console.error('Error updating language', err),
        })
    }

    private getOrganization(id: string) {
        this.organizationApiService.findById(id).subscribe({
            next: (res) => {
                this.organization.set(res.data ?? null)
            },
        })
    }

    private getUserSetting() {
        this.userSettingsApiService.getUsersSettingsByUserId().subscribe((res) => {
            const settings = res.data?.settings
            if (settings) {
                this.themeChecked = settings['theme'] === 'dark'
                this.languageChecked = settings['language'] === 'bn'
            }
        })
    }
}
