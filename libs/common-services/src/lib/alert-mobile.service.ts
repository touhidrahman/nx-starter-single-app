import { Injectable, inject } from '@angular/core'
import { ToastController } from '@ionic/angular'

@Injectable({
    providedIn: 'root',
})
export class AlertMobileService {
    toastController = inject(ToastController)

    async showToast(options: {
        message: string
        icon?: string
        color?: 'success' | 'danger' | 'warning'
        position?: 'top' | 'bottom'
        duration?: number
    }) {
        const toast = await this.toastController.create({
            message: options.message || 'No message assigned!',
            duration: options.duration || 3000,
            position: options.position || 'top',
            color: options.color || 'success',
            icon: options.icon || 'checkmark-circle-outline',
            buttons: [{ text: 'OK', role: 'cancel' }],
        })
        await toast.present()
    }
}
