import { CommonModule } from '@angular/common'
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { GoogleMapsModule } from '@angular/google-maps'
import { ApiResponse, LabelValuePair } from '@repo/common-models'
import { AlertService, GoogleMapService, ThemeService } from '@repo/common-services'
import {
    DISTRICTS,
    Lawyer,
    LawyerApiService,
    LawyerFormService,
    LawyerMarker,
    LawyerType,
    lawyerTypes,
} from '@repo/lawyer'
import { PrimeModules } from '@repo/prime-modules'

@Component({
    selector: 'app-page-lawyer-profile',
    standalone: true,
    imports: [ReactiveFormsModule, PrimeModules, CommonModule, GoogleMapsModule],
    templateUrl: './page-lawyer-profile.component.html',
    styleUrl: './page-lawyer-profile.component.css',
    providers: [LawyerFormService],
})
export class PageLawyerProfileComponent implements OnInit {
    private lawyerApiService = inject(LawyerApiService)
    private alertService = inject(AlertService)
    private themeService = inject(ThemeService)

    protected googleMapService = inject(GoogleMapService)
    protected lawyerFormService = inject(LawyerFormService)
    isLoading = signal<boolean>(false)
    isMapReady = signal<boolean>(false)

    currentYear = new Date().getFullYear()
    today = new Date()
    lawyerTypes: LawyerType[] = lawyerTypes
    districts: LabelValuePair<string>[] = DISTRICTS

    lawyerMarkers: LawyerMarker<google.maps.LatLngLiteral>[] = []

    @ViewChild('addressInput', { static: false })
    addressInput: ElementRef<HTMLInputElement> | undefined
    private autocomplete!: google.maps.places.Autocomplete
    mapOptions: google.maps.MapOptions = {}

    private darkStyle: google.maps.MapTypeStyle[] = [
        { elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#d0d0d0' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#3a3a3a' }] },
        {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ color: '#b0b0b0' }],
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#505050' }],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#606060' }],
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#3a3a3a' }],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#202020' }],
        },
    ]

    ngOnInit(): void {
        this.loadGoogleMap()
        this.applyTheme(this.themeService.isDark)
    }

    private applyTheme(isDark: boolean) {
        this.mapOptions = {
            disableDefaultUI: false,
            zoomControl: true,
            styles: isDark ? this.darkStyle : [],
        }
    }

    onMapClick(event: google.maps.MapMouseEvent): void {
        if (event.latLng) {
            const lat = event.latLng.lat()
            const lng = event.latLng.lng()
            this.lawyerFormService.form.patchValue({
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
            })
            this.lawyerMarkers = [
                {
                    position: { lat, lng },
                    title: 'Clicked Location',
                    content: this.googleMapService.createMarkerContent(
                        'Clicked Location',
                        '#FF0000',
                    ),
                },
            ]
        }
    }

    onSubmitted() {
        if (this.lawyerFormService.form.valid) {
            this.isLoading.set(true)
            const formValues = this.lawyerFormService.form.value
            const convertedValue = {
                ...formValues,
                practiceStartYear:
                    formValues.practiceStartYear instanceof Date
                        ? formValues.practiceStartYear.getFullYear()
                        : Number(formValues.practiceStartYear),
                latitude: formValues.latitude ? Number(formValues.latitude) : null,
                longitude: formValues.longitude ? Number(formValues.longitude) : null,
            }

            this.create(convertedValue)
        }
    }

    private loadGoogleMap() {
        this.googleMapService
            .loadGoogleMaps()
            .then(() => {
                this.isMapReady.set(true)
                this.intAutoComplete()
            })
            .catch(() => {
                this.alertService.error('Failed to load Google Maps')
            })
    }

    private create(lawyer: Lawyer) {
        this.lawyerApiService.createLawyer(lawyer).subscribe({
            next: (res: ApiResponse<Lawyer>) => {
                if (res.data) {
                    this.lawyerFormService.form.reset()
                    this.isLoading.set(false)
                    this.alertService.success('Lawyer added successfully')
                }
            },
            error: () => {
                this.isLoading.set(false)
                this.alertService.error('Lawyer add failed')
            },
        })
    }

    private intAutoComplete(): void {
        if (!this.addressInput || !this.isMapReady()) {
            return
        }
        this.autocomplete = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
            types: ['address'],
            componentRestrictions: { country: ['bd'] },
            bounds: new google.maps.LatLngBounds(
                this.googleMapService.mapCenter(),
                this.googleMapService.mapCenter(),
            ),
            strictBounds: false,
        })

        this.autocomplete.addListener('place_changed', () => {
            this.onPlaceSelected()
        })
    }

    private onPlaceSelected(): void {
        const place = this.autocomplete.getPlace()

        if (!place.geometry || !place.geometry.location) {
            return
        }

        const addressComponents = place.address_components || []
        let address = ''
        let city = ''

        for (const component of addressComponents) {
            const types = component.types
            if (types.includes('street_number') || types.includes('route')) {
                address += (address ? ' ' : '') + component.long_name
            } else if (types.includes('locality')) {
                city = component.long_name
            }
        }

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        this.lawyerFormService.form.patchValue({
            address: address || place.formatted_address || '',
            city,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        })

        this.googleMapService.mapCenter.set({ lat, lng })
        this.lawyerMarkers = [
            {
                position: { lat, lng },
                title: address || 'Selected Address',
                content: this.googleMapService.createMarkerContent(
                    address || place.formatted_address || 'Selected Address',
                    '#FF0000',
                ),
            },
        ]
    }
}
