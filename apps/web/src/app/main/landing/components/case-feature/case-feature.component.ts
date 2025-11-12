import { CommonModule, NgOptimizedImage } from '@angular/common'
import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewChildren,
} from '@angular/core'

interface contentSection {
    id: number
    icon: string
    title: string
    subtitle: string
    description: string
    imageClass: string
    imageUrl: string
}

@Component({
    selector: 'app-case-feature',
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './case-feature.component.html',
    styleUrls: ['./case-feature.component.css'],
})
export class CaseFeatureComponent implements AfterViewInit, OnDestroy {
    @ViewChildren('sectionRef', { read: ElementRef })
    sections!: QueryList<ElementRef>

    private observer?: IntersectionObserver

    sectionsData: contentSection[] = [
        {
            id: 1,
            icon: 'assets/images/icons/events.png',
            title: 'Case Events',
            subtitle: 'Never miss a moment',
            description:
                'Stay informed with a clear timeline of case updates and important alerts.',
            imageClass: 'image--1',
            imageUrl: 'assets/images/events.png',
        },
        {
            id: 2,
            icon: 'assets/images/icons/notes.png',
            title: 'Case Notes',
            subtitle: 'Your thoughts, organized',
            description:
                'Record and revisit legal insights to stay prepared and focused.',
            imageClass: 'image--2',
            imageUrl: 'assets/images/notes.png',
        },
        {
            id: 3,
            icon: 'assets/images/icons/parties.png',
            title: 'Case Parties',
            subtitle: 'Everyone in their place',
            description: 'Manage all involved parties with structure and ease.',
            imageClass: 'image--3',
            imageUrl: 'assets/images/parties.png',
        },
        {
            id: 4,
            icon: 'assets/images/icons/documents.png',
            title: 'Documents',
            subtitle: 'All files, one home',
            description:
                'Securely store, organize, and access case documents anytime.',
            imageClass: 'image--4',
            imageUrl: 'assets/images/documents.png',
        },
        {
            id: 5,
            icon: 'assets/images/icons/clients.png',
            title: 'Clients',
            subtitle: 'Better coordination, stronger cases',
            description:
                'Keep client details accurate and always within reach.',
            imageClass: 'image--5',
            imageUrl: 'assets/images/clients.png',
        },
        {
            id: 6,
            icon: 'assets/images/icons/court.png',
            title: 'Court Transfers',
            subtitle: 'Track every move',
            description: 'See exactly how and when cases shift between courts.',
            imageClass: 'image--6',
            imageUrl: 'assets/images/court.png',
        },
        {
            id: 7,
            icon: 'assets/images/icons/follow.png',
            title: 'Follow Requests',
            subtitle: 'Controlled access, engaged clients',
            description:
                'Allow approved followers to stay updated without compromising privacy.',
            imageClass: 'image--7',
            imageUrl: 'assets/images/follow.png',
        },
        {
            id: 8,
            icon: 'assets/images/icons/assigned.png',
            title: 'Assigned Members',
            subtitle: 'The right people on every case',
            description:
                'Easily see and manage the team members assigned to handle case tasks, ensuring accountability and smooth collaboration.',
            imageClass: 'image--8',
            imageUrl: 'assets/images/assigned.png',
        },
    ]

    ngAfterViewInit(): void {
        if (typeof window.IntersectionObserver !== 'undefined') {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const targetEl = entry.target as HTMLElement
                        const swapClass = targetEl.dataset['swap'] ?? ''
                        const imgEl = document.querySelector(
                            `.locker__container .${swapClass}`,
                        ) as HTMLElement

                        if (imgEl) {
                            if (entry.isIntersecting) {
                                imgEl.classList.add('opacity-100')
                                imgEl.classList.remove('opacity-0')
                            } else {
                                imgEl.classList.remove('opacity-100')
                                imgEl.classList.add('opacity-0')
                            }
                        }
                    })
                },
                { threshold: [0.5, 1] },
            )

            this.sections.forEach((section) => {
                this.observer?.observe(section.nativeElement)
            })
        }
    }

    ngOnDestroy(): void {
        this.observer?.disconnect()
    }
}
