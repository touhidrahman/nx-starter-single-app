import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { JwtService } from '@repo/common-auth'
import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { InvitationApiService, InvitationTokenPayload } from '@repo/group'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-accept-invite',
    imports: [PrimeModules],
    templateUrl: './page-accept-invite.component.html',
    styleUrl: './page-accept-invite.component.scss',
})
export class PageAcceptInviteComponent implements OnInit {
    private authStateService = inject(AuthStateService)
    private jwtService = inject(JwtService)
    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)
    private alertService = inject(AlertService)
    private invitationApiService = inject(InvitationApiService)

    role = signal<string>('')
    errors = signal<string[]>([])
    isLoading = signal(false)
    invitationToken = signal<string>('')
    organizationName = signal<string>('')
    organizationId = signal<string>('')

    ngOnInit(): void {
        const token = this.activatedRoute.snapshot.queryParams['token']
        this.invitationToken.set(token)
        if (token) {
            const decoded =
                this.jwtService.getUnexpiredDecoded<InvitationTokenPayload>(
                    token,
                )
            if (decoded) {
                // logout existing user first
                if (this.authStateService.isLoggedIn()) {
                    this.authStateService.logout()
                    window.location.reload()
                }

                const { roleId, organizationId, organizationName } = decoded

                this.organizationId.set(organizationId)
                this.organizationName.set(organizationName)
                this.role.set(roleId)
            } else {
                this.alertService.warn('Your invitation has expired!')
            }
        }
    }

    acceptInvite() {
        this.isLoading.set(true)

        this.invitationApiService
            .acceptInvite(this.invitationToken())
            .subscribe({
                next: (
                    data: ApiResponse<{ redirect: boolean; url: string }>,
                ) => {
                    this.isLoading.set(false)
                    if (data.data?.url === '/signup') {
                        this.router.navigate(['/signup'], {
                            queryParams: { token: this.invitationToken() },
                        })
                    } else if (data.data?.url === '/login') {
                        this.router.navigate(['/login'])
                    } else {
                        this.alertService.success(
                            data?.message || 'Invitation accepted successfully',
                        )
                        this.router.navigateByUrl('/login')
                    }
                },
                error: (error) => {
                    this.alertService.error(error.err.message)
                    this.isLoading.set(false)
                },
            })
    }
}
