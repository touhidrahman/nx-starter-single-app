import { AsyncPipe } from '@angular/common'
import { Component, Input, inject, OnInit, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { FollowedCasesStateService } from '@repo/case'
import { AppDetailsService } from '@repo/common-services'
import { PrimeModules } from '@repo/prime-modules'
import { BadgeModule } from 'primeng/badge'
import { clientNavigationItems, navigationItems } from './sidebar.data'
import { NavigationItem } from './sidebar.model'

@Component({
    selector: 'app-sidebar-default',
    imports: [RouterModule, PrimeModules, AsyncPipe, BadgeModule],
    templateUrl: './sidebar-default.component.html',
    styleUrl: './sidebar-default.component.scss',
    providers: [FollowedCasesStateService, AppDetailsService],
})
export class SidebarDefaultComponent implements OnInit {
    readonly followedCasesStateService = inject(FollowedCasesStateService)
    authStateService = inject(AuthStateService)
    private appDetailsService = inject(AppDetailsService)
    @Input() isCollapsed = false
    version = signal<string>(this.appDetailsService.getAppDetails().version)

    navigationItems: NavigationItem[] = navigationItems
    clientNavigationItems: NavigationItem[] = clientNavigationItems
    isClient = signal(false)
    groupType = signal<string | null>(null)

    ngOnInit(): void {
        this.groupType.set(this.authStateService.getGroup()?.type ?? null)
        this.isClient.set(this.groupType() === 'client')
        this.followedCasesStateService.init(true)
    }
}
