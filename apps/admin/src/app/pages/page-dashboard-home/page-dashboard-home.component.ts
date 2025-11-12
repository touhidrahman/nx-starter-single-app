import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { ApiResponse } from '@repo/common-models'
import { AdminHomeApiService, BalanceData } from '@repo/home'

@Component({
    selector: 'app-page-dashboard-home',
    imports: [CommonModule],
    templateUrl: './page-dashboard-home.component.html',
    styleUrl: './page-dashboard-home.component.scss',
})
export class PageDashboardHomeComponent {
    private adminHomeApiService = inject(AdminHomeApiService)
    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)
    homeBalanceCounts = signal<BalanceData>({
        balance: '',
        validity: '',
    })

    ngOnInit(): void {
        this.getBalanceCounts()
    }

    private getBalanceCounts() {
        this.isLoading.set(true)
        this.adminHomeApiService.getSmsBalanceData().subscribe({
            next: (res: ApiResponse<BalanceData>) => {
                this.homeBalanceCounts.set(res.data)
                this.isLoading.set(false)
            },
            error: (_err) => {
                this.isLoading.set(false)
                this.isError.set(true)
            },
        })
    }
}
