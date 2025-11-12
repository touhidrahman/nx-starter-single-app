import { Injectable, inject, signal } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class HeaderService {
    private router = inject(Router)

    readonly menuOpen = signal(false)
    readonly isHomePage = signal(true)

    private init() {
        this.updateHomeState()
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => this.updateHomeState())
    }

    constructor() {
        this.init()
    }

    toggleMenu() {
        this.menuOpen.set(!this.menuOpen())
    }

    closeMenu() {
        this.menuOpen.set(false)
    }

    private updateHomeState() {
        const url = this.router.url.split('#')[0]
        this.isHomePage.set(url === '/')
    }
}
