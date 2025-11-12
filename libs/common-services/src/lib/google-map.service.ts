import { Inject, Injectable, signal } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { Loader } from '@googlemaps/js-api-loader'
import { APP_ENVIRONMENT, AppEnvironmentConfig } from '@repo/core'

@Injectable({
    providedIn: 'root',
})
export class GoogleMapService {
    googleMapsApiKey = ''

    mapCenter = signal<google.maps.LatLngLiteral>({ lat: 23.685, lng: 90.3563 })
    mapZoom = signal<number>(12)
    mapOptions = signal<google.maps.MapOptions>({
        mapTypeId: 'roadmap',
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        maxZoom: 15,
        minZoom: 5,
    })

    constructor(
        @Inject(APP_ENVIRONMENT)
        private env: AppEnvironmentConfig,
    ) {
        this.googleMapsApiKey = this.env.googleMapsApiKey || ''
    }

    getGoogleMapsApiKey(): string {
        return this.googleMapsApiKey
    }

    createMarkerContent(title: string, color: string): string {
        return `<div style="color: ${color}">${title}</div>`
    }

    loadGoogleMaps(): Promise<void> {
        const loader = new Loader({
            apiKey: this.getGoogleMapsApiKey(),
            version: 'weekly',
            libraries: ['places'],
        })

        return loader
            .load()
            .then(() => { })
            .catch((error) => {
                throw new Error(`Failed to load Google Maps: ${error}`)
            })
    }
}
