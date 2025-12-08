import { DOCUMENT } from '@angular/common'
import { Injectable, inject, Renderer2, RendererFactory2 } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private isDarkMode = false
    private document = inject(DOCUMENT)
    private rendererFactory = inject(RendererFactory2)
    private renderer: Renderer2 = this.rendererFactory.createRenderer(null, null)

    constructor() {
        const savedTheme = localStorage.getItem('isDarkMode')
        if (savedTheme === 'true') {
            this.isDarkMode = true
            this.renderer.addClass(this.document.documentElement, 'dark')
        }
    }

    get isDark(): boolean {
        return this.isDarkMode
    }

    setTheme(isDark: boolean) {
        this.isDarkMode = isDark
        localStorage.setItem('isDarkMode', String(isDark))
        if (isDark) {
            this.renderer.addClass(this.document.documentElement, 'dark')
        } else {
            this.renderer.removeClass(this.document.documentElement, 'dark')
        }
    }
}
