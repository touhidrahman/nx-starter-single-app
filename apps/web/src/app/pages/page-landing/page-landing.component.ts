import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PrimeModules } from '@repo/prime-modules'
import { CalendarFeatureComponent } from '../../main/landing/components/calendar-feature/calendar-feature.component'
import { CaseFeatureComponent } from '../../main/landing/components/case-feature/case-feature.component'
import { DownloadAppComponent } from '../../main/landing/components/download-app/download-app.component'
import { FaqComponent } from '../../main/landing/components/FAQ/faq.component'
import { LawyerSearchComponent } from '../../main/landing/components/lawyer-search/lawyer-search.component'
import { PricePlanComponent } from '../../main/landing/components/price-plan/price-plan.component'
import { ServiceSectionComponent } from '../../main/landing/components/service-section/service-section.component'
import { LandingPageHeroSectionComponent } from '../../main/new-landing/landing-hero/landing-page-hero-section.component.'

@Component({
    selector: 'app-page-landing',
    imports: [
        PrimeModules,
        RouterModule,
        FaqComponent,
        ServiceSectionComponent,
        LandingPageHeroSectionComponent,
        DownloadAppComponent,
        CalendarFeatureComponent,
        CaseFeatureComponent,
        LawyerSearchComponent,
        PricePlanComponent,
    ],
    templateUrl: './page-landing.component.html',
    styleUrl: './page-landing.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLandingComponent {}
