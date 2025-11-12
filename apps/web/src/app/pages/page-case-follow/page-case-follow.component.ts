import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { Case, CaseFollowRequestApiService } from '@repo/case'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-case-follow',
    imports: [CommonModule, PrimeModules],
    templateUrl: './page-case-follow.component.html',
    styleUrl: './page-case-follow.component.scss',
})
export class PageCaseFollowComponent {
    private caseFollowRequestApiService = inject(CaseFollowRequestApiService)
    private authStateService = inject(AuthStateService)
    private alertService = inject(AlertService)
    private route = inject(ActivatedRoute)
    private router = inject(Router)

    token = signal<string>('')
    caseData = signal<Case | null>(null)

    ngOnInit() {
        this.route.queryParamMap.subscribe((params) => {
            this.token.set(params.get('token') as string)
            this.decode()
        })
    }

    decode() {
        this.caseFollowRequestApiService.decodeToken(this.token()).subscribe({
            next: (res) => {
                this.caseData.set(res.data)
            },
            error: (err) => {
                this.alertService.error(err.error.message)
                this.caseData.set(null)
            },
        })
    }

    sendRequest(caseData: Case) {
        if (!this.authStateService.isLoggedIn()) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: this.router.url },
            })
            return
        }
        this.caseFollowRequestApiService
            .sendRequestToFollow(caseData.id)
            .subscribe({
                next: (_res) => {
                    this.alertService.success('Follow request sent')
                    this.router.navigate(['/dashboard/home/client'])
                },
                error: (err) => {
                    this.alertService.error(err.error.message)
                },
            })
    }
}
