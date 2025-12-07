import { Component, inject, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { LoginFormService } from '@repo/common-auth'
import { PrimeModules } from '@repo/prime-modules'
import { AdminAuthStateService } from '@repo/auth'

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [...PrimeModules, ReactiveFormsModule, RouterModule],
    templateUrl: './page-admin-login.component.html',
    styleUrls: ['./page-admin-login.component.scss'],
    providers: [LoginFormService],
})
export class PageAdminLoginComponent implements OnInit {
    private adminAuthState = inject(AdminAuthStateService)
    private route = inject(ActivatedRoute)
    private router = inject(Router)

    loginFormService = inject(LoginFormService) // <-- Using original service unchanged
    isLoading = signal(false)
    errors: string[] = []
    returnUrl = ''

    ngOnInit(): void {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard-home'
        if (this.adminAuthState.isLoggedIn()) {
            this.router.navigateByUrl(this.returnUrl)
        }
    }

    submit(): void {
        if (this.loginFormService.form.invalid || this.isLoading()) return

        this.isLoading.set(true)
        this.errors = []

        // Get values using original service (returns {identifier, password})
        const { identifier, password } = this.loginFormService.getValue()

        // Transform to API format here
        this.adminAuthState.login(identifier, password).subscribe({
            next: () => {
                this.router.navigateByUrl(this.returnUrl)
                this.isLoading.set(false)
            },
            error: (err) => {
                this.errors = [err.error?.message || 'Admin login failed']
                this.isLoading.set(false)
            },
        })
    }
}
