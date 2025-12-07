import { NgOptimizedImage } from '@angular/common'
import { Component } from '@angular/core'

interface ServiceItem {
    icon: string
    alt: string
    title: string
    description: string
    extraClasses?: string
}

@Component({
    standalone: true,
    selector: 'app-services-section',
    imports: [NgOptimizedImage],
    templateUrl: './service-section.component.html',
    styleUrl: './service-section.component.scss',
})
export class ServiceSectionComponent {
    sectionTitle = 'Services we provide'
    sectionSubtitle =
        'Everything You Need, All in One Place. MyApp gives you the tools to solve your legal issues without the stress.'

    services: ServiceItem[] = [
        {
            icon: 'assets/images/icons/1.png',
            alt: 'Easy Case Management',
            title: 'Easy Case Management',
            description: 'Organize all case documents, deadlines, and communication in one place.​',
            extraClasses: 'md:p-8 lg:p-14',
        },
        {
            icon: 'assets/images/icons/2.png',
            alt: 'Real-Time Case Tracking',
            title: 'Real-Time Case Tracking',
            description: 'Always know what’s happening in your case with real-time updates.​',
            extraClasses: 'md:border-l md:border-gray-200 md:p-8 lg:p-14',
        },
        {
            icon: 'assets/images/icons/3.png',
            alt: 'Integrated Calendar',
            title: 'Integrated Calendar',
            description: 'Never miss a date—track court dates, appointments, and tasks easily.​',
            extraClasses: 'md:border-l md:border-gray-200 md:p-8 lg:p-14',
        },
        {
            icon: 'assets/images/icons/4.png',
            alt: 'Court Management',
            title: 'Court Management',
            description: 'All registered courts of Bangladesh are listed.​',
            extraClasses: 'md:border-t md:border-gray-200 md:p-8 lg:p-14',
        },
        {
            icon: 'assets/images/icons/5.png',
            alt: 'Organization Control',
            title: 'Organization Control',
            description: 'Control legal operations across departments securely and efficiently.​',
            extraClasses: 'md:border-t md:border-l md:border-gray-200 md:p-8 lg:p-14',
        },
        {
            icon: 'assets/images/icons/6.png',
            alt: 'Support',
            title: 'Support',
            description: 'Chat or call with MyApp support team anytime you need assistance.​',
            extraClasses: 'md:border-t md:border-l md:border-gray-200 md:p-8 lg:p-14',
        },
    ]
}
