import { Component, inject, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import {
    AdminRegisterFormService,
    AdminSignupInput,
    JwtService,
} from '@repo/common-auth'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { AdminAuthStateService } from 'libs/auth/src/lib/admin-auth-state.service'
import { DynamicDialogRef } from 'primeng/dynamicdialog'

@Component({
    selector: 'app-admin-add-dialog',
    imports: [PrimeModules, ReactiveFormsModule],
    templateUrl: './admin-add-dialog.component.html',
    styleUrl: './admin-add-dialog.component.scss',
    providers: [AdminRegisterFormService],
})
export class AdminAddDialogComponent {
    private authStateService = inject(AdminAuthStateService)
    private jwtService = inject(JwtService)
    private adminRegisterFormService = inject(AdminRegisterFormService)
    private activatedRoute = inject(ActivatedRoute)
    private alertService = inject(AlertService)
    private ref = inject(DynamicDialogRef)

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
            next: (res) => {
                this.isLoading.set(false)
                this.ref?.close(res.data)
            },
            error: (error) => {
                this.isLoading.set(false)
                this.errors.set([error.error.message])
                this.alertService.error(error.error.message)
            },
        })
    }
}
