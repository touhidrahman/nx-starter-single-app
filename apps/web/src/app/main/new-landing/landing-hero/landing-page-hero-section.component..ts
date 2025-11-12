import { NgOptimizedImage } from '@angular/common'
import { Component, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { environment } from '../../../../environment/environment'

@Component({
    selector: 'app-landing-page-hero-section',
    imports: [RouterModule, NgOptimizedImage],
    templateUrl: './landing-page-hero-section.component.html',
    styleUrl: './landing-page-hero-section.component.scss',
})
export class LandingPageHeroSectionComponent {
    isIos = signal<boolean>(environment.platform === 'ios')
}
