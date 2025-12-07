import { Injectable, signal } from '@angular/core'
import { timer } from 'rxjs'

export interface HeaderRoute {
    id: string
    title: string
}

@Injectable({ providedIn: 'root' })
export class HeaderScrollService {
    activeSection = signal<string>('')
    isScrolled = signal<boolean>(false)
    private observer?: IntersectionObserver
    private isProgrammatic = false

    initScrollTracking(headerRoutesData: HeaderRoute[]) {
        timer(1500).subscribe({
            next: () => this.setupIntersectionObserver(headerRoutesData),
        })
    }

    handleScroll(headerRoutesData: HeaderRoute[]) {
        const y = window.scrollY || 0
        this.isScrolled.set(y > 50)
        if (!this.isProgrammatic) this.updateActiveSection(headerRoutesData)
    }

    navigateToFragment(sectionId: string, closeMenu: () => void) {
        this.isProgrammatic = true
        const newUrl = `/#${sectionId}`
        window.history.replaceState(null, '', newUrl)
        closeMenu()
        this.scrollToElement(sectionId)

        setTimeout(() => {
            this.isProgrammatic = false
            this.activeSection.set(sectionId)
        }, 1000)
    }

    navigateToTop(closeMenu: () => void) {
        this.activeSection.set('')
        closeMenu()
        this.isProgrammatic = true
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => (this.isProgrammatic = false), 1000)
    }

    private updateActiveSection(headerRoutesData: HeaderRoute[]) {
        const scrollY = window.pageYOffset + 100
        let current = ''
        let closest = Number.MAX_VALUE

        for (const link of headerRoutesData) {
            const section = document.getElementById(link.id)
            if (!section) continue

            const top = section.offsetTop
            const bottom = top + section.offsetHeight
            const inView = scrollY >= top - 100 && scrollY <= bottom - 100

            if (inView) {
                const distance = Math.abs(top - scrollY)
                if (distance < closest) {
                    closest = distance
                    current = link.id
                }
            }
        }

        if (current && current !== this.activeSection()) {
            this.activeSection.set(current)
        }
    }

    private setupIntersectionObserver(headerRoutesData: HeaderRoute[]) {
        this.observer?.disconnect()

        const options = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: [0, 0.1, 0.2, 0.5, 0.8, 1],
        }

        this.observer = new IntersectionObserver((entries) => {
            if (this.isProgrammatic) return

            let mostVisible = ''
            let maxVisible = 0

            for (const entry of entries) {
                const visible = entry.intersectionRect.height / entry.boundingClientRect.height
                const topBonus = entry.boundingClientRect.top >= 0 ? 1 : 0.5
                const score = visible * topBonus

                if (score > maxVisible && visible > 0.1) {
                    maxVisible = score
                    mostVisible = entry.target.id
                }
            }

            if (mostVisible) this.activeSection.set(mostVisible)
        }, options)

        headerRoutesData.forEach((link) => {
            const section = document.getElementById(link.id)
            if (section) this.observer?.observe(section)
        })
    }

    private scrollToElement(id: string) {
        const section = document.getElementById(id)
        if (!section) return
        const offset = section.getBoundingClientRect().top + window.pageYOffset - 100
        window.scrollTo({ top: offset, behavior: 'smooth' })
    }
}
