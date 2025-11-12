import { Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { navigationItems } from './sidebar.data'
import { NavigationItem } from './sidebar.model'

@Component({
    selector: 'app-sidebar-default',
    imports: [RouterModule, PrimeModules],
    templateUrl: './sidebar-default.component.html',
    styleUrl: './sidebar-default.component.scss',
})
export class SidebarDefaultComponent {
    @Input() isCollapsed = false
    navigationItems: NavigationItem[] = navigationItems
}
