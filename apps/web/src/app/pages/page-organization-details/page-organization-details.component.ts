import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AuthStateService } from '@repo/auth'
import { PrimeModules } from '@repo/prime-modules'
import { tabData } from './tab.data'

@Component({
    selector: 'app-page-organization-details',
    imports: [FormsModule, RouterModule, PrimeModules],
    templateUrl: './page-organization-details.component.html',
    styleUrl: './page-organization-details.component.scss',
})
export class PageOrganizationDetailsComponent implements OnInit {
    private authStateService = inject(AuthStateService)

    readonly tabs = signal(tabData)
    readonly isClientGroup = signal<boolean>(false)

    readonly visibleTabs = computed(() => {
        const tabs = this.tabs()
        return this.isClientGroup() ? tabs.filter((tab) => tab.isClient !== false) : tabs
    })

    ngOnInit() {
        this.determineGroupType()
    }

    private determineGroupType(): void {
        const groupType = this.authStateService.getGroupType()
        this.isClientGroup.set(groupType === 'client')
    }
}
