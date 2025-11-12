import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import {
    ClientUpcomingCasesComponent,
    FollowedCasesStateService,
} from '@repo/case'
import { PrimeModules } from '@repo/prime-modules'
import { ProfileStateService } from '@repo/user'

@Component({
    selector: 'app-page-home-client',
    imports: [CommonModule, PrimeModules, ClientUpcomingCasesComponent],
    templateUrl: './page-home-client.component.html',
    styleUrl: './page-home-client.component.scss',
    providers: [FollowedCasesStateService],
})
export class PageHomeClientComponent implements OnInit {
    readonly followedCasesStateService = inject(FollowedCasesStateService)
    private readonly router = inject(Router)
    profileStateService = inject(ProfileStateService)

    ngOnInit() {
        this.followedCasesStateService.init(true)
    }

    viewAllCases() {
        this.router.navigate(['/client/followed-cases'])
    }
}
