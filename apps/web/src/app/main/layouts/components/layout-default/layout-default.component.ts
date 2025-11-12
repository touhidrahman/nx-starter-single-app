import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { HeaderDefaultComponent } from '../../../headers/components/header-default/header-default.component'
import { SidebarDefaultComponent } from '../../../sidebars/components/sidebar-default/sidebar-default.component'

@Component({
    selector: 'app-layout-default',
    imports: [SidebarDefaultComponent, HeaderDefaultComponent, CommonModule],
    templateUrl: './layout-default.component.html',
    styleUrl: './layout-default.component.scss',
})
export class LayoutDefaultComponent {
    isSidebarCollapsed = false
    isMobileSidebarOpen = false

    toggleSidebar() {
        if (window.innerWidth <= 768) {
            this.isMobileSidebarOpen = !this.isMobileSidebarOpen
        } else {
            this.isSidebarCollapsed = !this.isSidebarCollapsed
        }
    }

    closeMobileSidebar() {
        this.isMobileSidebarOpen = false
    }
}
