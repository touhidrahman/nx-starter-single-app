import { Injectable, inject } from '@angular/core'
import { TokenStorageService } from './token-storage.service'

const TOKEN_SHARING_CHANNEL = 'token-sharing'
const REQUESTING_TOKEN = 'requesting-token'
const LOGOUT = 'logout'

/**
 * Syncs API tokens between newly opened tabs using BroadcastChannel API
 */
@Injectable({
    providedIn: 'root',
})
export class TokenSharingService {
    private bc = new BroadcastChannel(TOKEN_SHARING_CHANNEL)
    private tokenStorageService = inject(TokenStorageService)

    init() {
        this.addBroadcastChannelListener()
        this.bc.postMessage(REQUESTING_TOKEN)
    }

    private addBroadcastChannelListener() {
        this.bc.addEventListener('message', (event) => {
            if (event.data === REQUESTING_TOKEN) {
                new BroadcastChannel(TOKEN_SHARING_CHANNEL).postMessage({
                    accessToken: this.tokenStorageService.getAccessToken(),
                    refreshToken: this.tokenStorageService.getRefreshToken(),
                })
            } else if (event.data === LOGOUT) {
                this.tokenStorageService.clear()
                window.location.href = '/login'
            } else {
                const { accessToken, refreshToken } = event.data

                accessToken &&
                    this.tokenStorageService.saveAccessToken(accessToken)

                refreshToken &&
                    this.tokenStorageService.saveRefreshToken(refreshToken)
            }
        })
    }

    broadcastLogout() {
        this.bc.postMessage(LOGOUT)
    }
}
