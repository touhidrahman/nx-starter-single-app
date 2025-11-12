import { AsyncPipe, CommonModule } from '@angular/common'
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { GoogleMapsModule } from '@angular/google-maps'
import { Router } from '@angular/router'
import { GoogleMapService } from '@repo/common-services'
import {
    Lawyer,
    LawyerMarker,
    LawyerStateService,
    PublicLawyerFilterComponent,
} from '@repo/lawyer'
import { PrimeModules } from '@repo/prime-modules'
import { ButtonModule } from 'primeng/button'
import { PaginatorModule } from 'primeng/paginator'
import { TablePageEvent } from 'primeng/table'
import { LawyerCardComponent } from '../../main/lawyer/lawyer-card/lawyer-card.component'

@Component({
    selector: 'app-page-lawyers',
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule,
        PaginatorModule,
        AsyncPipe,
        LawyerCardComponent,
        PrimeModules,
        PublicLawyerFilterComponent,
        GoogleMapsModule,
    ],
    templateUrl: './page-lawyers.component.html',
    styleUrl: './page-lawyers.component.scss',
    providers: [LawyerStateService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLawyersComponent implements OnInit {
    protected lawyerStateService = inject(LawyerStateService)
    protected googleMapService = inject(GoogleMapService)
    private router = inject(Router)
    isPublic = signal<boolean>(false)
    displayFilterModal = signal(false)
    displayMapModal = signal<boolean>(false)
    isMapReady = signal<boolean>(false)
    isListView = signal<boolean>(true)

    lawyerMarkers: LawyerMarker<google.maps.LatLngLiteral>[] = []

    ngOnInit() {
        this.loadGoogleMap()
        this.lawyerStateService.init()
        this.isPublicPage()
    }

    isPublicPage() {
        if (this.router.url === '/lawyers') {
            this.isPublic.set(true)
        }
    }

    openFilterModal() {
        this.displayFilterModal.set(true)
    }

    closeFilterModal() {
        this.displayFilterModal.set(false)
    }

    setView(view: 'list' | 'map') {
        this.isListView.set(view === 'list')
        if (view === 'map') {
            this.updateMapMarkers()
        }
    }

    onLawyerSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.lawyerStateService.setState({ search: value, page: 1 })
    }

    onPageChange({ first, rows }: TablePageEvent) {
        const page = first / rows + 1
        this.lawyerStateService.setState({ page, size: rows })
    }

    private loadGoogleMap() {
        this.googleMapService
            .loadGoogleMaps()
            .then(() => {
                this.isMapReady.set(true)
                this.updateMapMarkers()
            })
            .catch((error) => {
                console.error('Failed to load Google Maps script:', error)
            })
    }

    private getLawyersWithLocation(lawyers?: Lawyer[]) {
        const currentLawyers =
            lawyers || this.lawyerStateService.getState().lawyers
        this.lawyerMarkers = currentLawyers
            .filter(
                (lawyer) =>
                    lawyer.status === 'approved' &&
                    lawyer.latitude &&
                    lawyer.longitude,
            )
            .map((lawyer) => ({
                position: {
                    lat: Number(lawyer.latitude),
                    lng: Number(lawyer.longitude),
                },
                title: lawyer.name || 'Lawyer',
                content: lawyer.name || 'Lawyer',
                options: {
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    },
                },
            }))
        return this.lawyerMarkers
    }

    private updateMapMarkers(): void {
        this.getLawyersWithLocation()
        if (this.lawyerMarkers.length > 0) {
            const bounds = new google.maps.LatLngBounds()
            this.lawyerMarkers.forEach((marker) => {
                bounds.extend(marker.position)
            })
            this.googleMapService.mapCenter.set(bounds.getCenter().toJSON())
            this.googleMapService.mapZoom.set(
                this.lawyerMarkers.length === 1 ? 12 : 7,
            )
        } else {
            this.googleMapService.mapCenter.set({ lat: 23.685, lng: 90.3563 })
            this.googleMapService.mapZoom.set(7)
        }
    }
}
