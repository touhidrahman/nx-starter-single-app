import { CommonModule, isPlatformBrowser } from '@angular/common'
import {
    Component,
    computed,
    inject,
    OnInit,
    PLATFORM_ID,
    signal,
} from '@angular/core'

import { ApiResponse } from '@repo/common-models'
import { AlertService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { ReferralApiService } from '../../referral-api.service'
import {
    ReferralCode,
    ReferralPoints,
    ReferredUser,
} from '../../referralCode.model'

@Component({
    selector: 'app-referral-code',
    imports: [CommonModule, PrimeModules],
    templateUrl: './referral-code.component.html',
    styleUrl: './referral-code.component.css',
})
export class ReferralCodeComponent implements OnInit {
    private referralApiService = inject(ReferralApiService)
    private alertService = inject(AlertService)
    private platformId = inject(PLATFORM_ID)

    referredUsers: ReferredUser[] = []
    points = signal({
        pointForReferral: 0,
        myPoints: 0,
        referredPoints: 0,
        totalPoints: 0,
        planName: '',
    })

    showReferredUsersTable = false
    loading = false

    baseUrl = signal<string>(window.location.origin)
    code = signal<string>('')
    referralLink = computed(
        () => `${this.baseUrl()}/signup?referralCode=${this.code()} `,
    )

    ngOnInit() {
        this.getReferralCode()
        this.getReferralPoints()
        this.getReferredUsers()
    }

    generate() {
        this.referralApiService.generateReferralCode().subscribe({
            next: (val: ApiResponse<ReferralCode>) => {
                this.code.set(val.data.referralCode)
            },
            error: (err) => {
                this.alertService.error(err.message || err.error.message)
            },
        })
    }

    private getReferralCode() {
        this.referralApiService.getReferralCode().subscribe({
            next: (val: ApiResponse<ReferralCode>) => {
                this.code.set(val.data.referralCode)
            },
            error: (err) => {
                if (err.status === 404) {
                    this.code.set('')
                } else {
                    this.alertService.error(err.message || err.error.message)
                }
            },
        })
    }

    private getReferralPoints() {
        this.referralApiService.getReferralPoints().subscribe({
            next: (val: ApiResponse<ReferralPoints>) => {
                this.points.update((p) => ({
                    ...p,
                    myPoints: val.data.myPoints?.myPoints ?? 0,
                    planName: val.data.myPoints?.planName ?? '',
                    referredPoints: val.data.referredPoints ?? 0,
                    totalPoints: val.data.totalPoints ?? 0,
                }))
            },
            error: () => {
                console.error('Failed to fetch own referral points')
            },
        })
    }

    // TODO : fix any type later
    private getReferredUsers() {
        this.loading = true
        this.referralApiService.getReferredUsers().subscribe({
            next: (val: ApiResponse<ReferredUser[]>) => {
                this.referredUsers = val.data
                this.loading = false
            },
            error: () => {
                this.loading = false
                this.referredUsers = []
            },
        })
    }

    toggleTable() {
        this.showReferredUsersTable = !this.showReferredUsersTable
    }

    onCopyCode(code: string) {
        if (isPlatformBrowser(this.platformId)) {
            navigator.clipboard
                .writeText(code)
                .then(() => this.alertService.success('Copied to clipboard!'))
                .catch((err) => console.error('Copy failed', err))
        }
    }
}
