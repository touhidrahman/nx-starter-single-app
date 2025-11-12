import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { PrimeModules } from '@repo/prime-modules'
import { PageLawComponent } from '../page-laws/page-law.component'

@Component({
    selector: 'app-page-settings',
    imports: [PrimeModules, FormsModule, RouterModule, PageLawComponent],
    templateUrl: './page-settings.html',
    styleUrl: './page-settings.scss',
})
export class PageSettingsComponent {
    authStateService = inject(AuthStateService)
    themeChecked = false
    languageChecked = false
    isClient = signal(false)
    groupType = signal<string | null>(null)

    ngOnInit(): void {
        this.groupType.set(this.authStateService.getGroup()?.type ?? null)
        this.isClient.set(this.groupType() === 'client')
    }
}
