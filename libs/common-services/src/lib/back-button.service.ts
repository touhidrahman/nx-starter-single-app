import { Location } from '@angular/common'
import { Injectable, inject, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

@Injectable({
    providedIn: 'root',
})
export class BackButtonService implements OnDestroy {
    private router = inject(Router)
    private location = inject(Location)
    private lastBackPress = 0
    private readonly exitThreshold = 2000 // 2 seconds
    private listener: any
    private rootRoutes = ['/', '/dashboard/home']

    async initialize() {
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
            return
        }

        this.listener = await App.addListener('backButton', async ({ canGoBack }) => {
            await this.handleBackButton(canGoBack)
        })
    }

    private async handleBackButton(canGoBack: boolean) {
        const currentUrl = this.router.url.split('?')[0]

        if (this.rootRoutes.includes(currentUrl) || !canGoBack) {
            const now = Date.now()

            if (now - this.lastBackPress < this.exitThreshold) {
                await this.forceExitApp()
            } else {
                this.lastBackPress = now
                this.showExitPrompt()
            }
        } else {
            this.location.back()
        }
    }

    private async forceExitApp() {
        try {
            await App.exitApp()
        } catch (e) {
            console.error('Capacitor exit failed:', e)
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
        try {
            if ((window as any).navigator?.app?.exitApp) {
                ;(window as any).navigator.app.exitApp()
            }
        } catch (e) {
            console.error('Native bridge exit failed:', e)
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
        try {
            if ((window as any).cordova?.plugins?.exit) {
                ;(window as any).cordova.plugins.exit()
            }
        } catch (e) {
            console.error('Cordova exit failed:', e)
        }
    }

    ngOnDestroy() {
        this.listener?.remove()
    }

    private showExitPrompt() {
        const message = document.createElement('div')
        message.textContent = 'Press back again to exit'
        message.style.position = 'fixed'
        message.style.bottom = '20px'
        message.style.left = '50%'
        message.style.transform = 'translateX(-50%)'
        message.style.backgroundColor = '#333'
        message.style.color = 'white'
        message.style.padding = '10px 20px'
        message.style.borderRadius = '20px'
        message.style.zIndex = '1000'
        message.id = 'exit-prompt'

        document.body.appendChild(message)

        setTimeout(() => {
            const element = document.getElementById('exit-prompt')
            if (element) element.remove()
        }, this.exitThreshold)
    }
}
