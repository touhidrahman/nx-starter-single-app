import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import {
    PinnedCaseListStateService,
    PinnedCasesComponent,
    UpcomingCaseListStateService,
    VendorUpcomingCasesComponent,
} from '@repo/case'
import { ApiResponse } from '@repo/common-models'
import { IsClickablePipe } from '@repo/common-pipes'
import { DashboardHomeData, HomeApiService, HomeData } from '@repo/home'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-home',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        CommonModule,
        PrimeModules,
        PinnedCasesComponent,
        VendorUpcomingCasesComponent,
        IsClickablePipe,
    ],
    templateUrl: './page-home.component.html',
    styleUrl: './page-home.component.scss',
    providers: [PinnedCaseListStateService, UpcomingCaseListStateService],
})
export class PageHomeComponent implements OnInit {
    private homeApiService = inject(HomeApiService)
    private router = inject(Router)

    isLoading = signal<boolean>(false)
    isError = signal<boolean>(false)
    homeTotalCounts = signal<DashboardHomeData[]>([])

    ngOnInit(): void {
        this.getTotalCounts()
    }

    private getTotalCounts() {
        this.homeApiService.getDashboardData().subscribe({
            next: (res: ApiResponse<HomeData>) => {
                const transformedData = this.mapToDashboardData(res.data)
                this.homeTotalCounts.set(transformedData)
                this.isLoading.set(false)
            },
            error: (_err) => {
                this.isLoading.set(false)
                this.isError.set(true)
            },
        })
    }

    private mapToDashboardData(data: HomeData): DashboardHomeData[] {
        return [
            {
                label: 'Total Cases',
                value: data.totalCases,
                icon: 'hammer',
                color: 'text-green-600',
                url: '/dashboard/cases',
            },
            {
                label: 'Active Cases',
                value: data.activeCases,
                icon: 'check-square',
                color: 'text-teal-600',
                url: '/dashboard/cases',
            },
            {
                label: 'Archived Cases',
                value: data.archivedCases,
                icon: 'box',
                color: 'text-cyan-600',
                url: '/dashboard/cases',
                queryParams: { status: 'archived' },
            },
            {
                label: 'Total Clients',
                value: data.totalClients,
                icon: 'users',
                color: 'text-emerald-600',
                url: '/dashboard/clients',
            },
        ]
    }

    isClickable(count: DashboardHomeData): boolean {
        if (count.value <= 0) return false
        return (
            count.label === 'Total Cases' ||
            count.label === 'Active Cases' ||
            count.label === 'Total Clients'
        )
    }

    onCardClick(count: DashboardHomeData): void {
        if (!this.isClickable(count)) return

        if (count.label === 'Total Cases' || count.label === 'Active Cases') {
            this.router.navigate(['/dashboard/cases'])
        } else if (count.label === 'Total Clients') {
            this.router.navigate(['/dashboard/clients'])
        }
    }
}
