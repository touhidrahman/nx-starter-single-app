import { Component, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import {
    AdminRegisterFormService,
    AdminSignupInput,
    JwtService,
} from '@repo/common-auth'
import { PrimeModules } from '@repo/prime-modules'
import { AdminAuthStateService } from '../admin-auth-state.service'

@Component({
    selector: 'myorg-page-admin-signup',
    imports: [...PrimeModules, RouterModule, ReactiveFormsModule],
    templateUrl: './page-admin-signup.component.html',
    styleUrl: './page-admin-signup.component.scss',
    providers: [AdminRegisterFormService],
})
export class PageAdminSignupComponent {
    private authStateService = inject(AdminAuthStateService)
    private jwtService = inject(JwtService)
    private adminRegisterFormService = inject(AdminRegisterFormService)
    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)

    defaultGroupId = ''
    role = ''
    errors = signal<string[]>([])
    isLoading = signal(false)

    get signUpForm() {
        return this.adminRegisterFormService.form
    }

    ngOnInit(): void {
        if (this.activatedRoute.snapshot.queryParams['token']) {
            const token = this.activatedRoute.snapshot.queryParams['token']
            const decoded = this.jwtService.getUnexpiredDecoded(token)
            if (decoded) {
                // logout existing user first
                if (this.authStateService.isLoggedIn()) {
                    this.authStateService.logout()
                    window.location.reload()
                }
            }
        }
    }
    register() {
        this.isLoading.set(true)
        if (this.adminRegisterFormService.form.invalid) {
            this.isLoading.set(false)
            return
        }

        const adminSignupInput: AdminSignupInput =
            this.adminRegisterFormService.getValue()

        this.authStateService.register(adminSignupInput).subscribe({
            next: () => {
                this.isLoading.set(false)
                this.router.navigate(['/login'])
            },
            error: (error) => {
                this.isLoading.set(false)
                this.errors.set([error.error.message])
            },
        })
    }
}
