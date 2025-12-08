import { Injectable } from '@angular/core'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

@Injectable({
    providedIn: 'root',
})
export class StatusBarService {
    async init() {
        if (!Capacitor.isNativePlatform()) {
            return
        }

        await this.configureStatusBar()
        this.applyStatusBarHeight()

        window.addEventListener('resize', () => this.applyStatusBarHeight())
    }

    private async configureStatusBar() {
        try {
            await StatusBar.show()

            await StatusBar.setOverlaysWebView({ overlay: false })

            await StatusBar.setStyle({ style: Style.Dark })
        } catch (err) {
            console.warn('[StatusBarService] StatusBar plugin not available', err)
        }
    }

    private applyStatusBarHeight() {
        const root = document.documentElement
        const statusBarHeight = getComputedStyle(root)
            .getPropertyValue('--status-bar-height')
            .trim()

        if (!statusBarHeight || statusBarHeight === '0px') {
            root.style.setProperty('--status-bar-height', '30px')
        }
    }
}
