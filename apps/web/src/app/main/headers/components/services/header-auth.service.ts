import { Injectable, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { LoginResponse } from '@repo/common-auth'
import { AlertService } from '@repo/common-services'

@Injectable({ providedIn: 'root' })
export class HeaderAuthService {
    private readonly router = inject(Router)
    private readonly alert = inject(AlertService)
    readonly auth = inject(AuthStateService)

    readonly isVisible = signal(false)
    readonly isLoading = signal(false)
    readonly isError = signal(false)
    readonly selectedGroupId = signal<string | null>(null)

    toggleDropdown() {
        this.isVisible.set(!this.isVisible())
    }

    logout() {
        this.isVisible.set(false)
        this.auth.logout()
        this.router.navigate(['/login'])
    }

    switchGroup(id: string) {
        this.isLoading.set(true)
        this.selectedGroupId.set(id)

        this.auth.switchOrg(id).subscribe({
            next: (_res: LoginResponse) => {
                this.alert.success('Group switched successfully.')
                window.location.reload()
            },
            error: () => {
                this.alert.error('Failed to switch group')
                this.isError.set(true)
            },
        })
    }
}
