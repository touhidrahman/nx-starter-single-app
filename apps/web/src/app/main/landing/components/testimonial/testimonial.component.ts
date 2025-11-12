import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { CarouselModule } from 'primeng/carousel'
import { TagModule } from 'primeng/tag'
import { SectionTitleComponent } from '../../utils/section-title/section-title.component'

@Component({
    selector: 'app-testimonial',
    standalone: true,
    imports: [
        CommonModule,
        CarouselModule,
        ButtonModule,
        TagModule,
        SectionTitleComponent,
    ],
    templateUrl: './testimonial.component.html',
    styleUrl: './testimonial.component.scss',
})
export class TestimonialComponent {
    testimonials = [
        {
            id: '1',
            name: 'Jane Doe',
            designation: 'Marketing Manager at Acme Inc.',
            image: 'https://randomuser.me/api/portraits/women/1.jpg',
            speech: 'Working with this team has been a game-changer for our business. Their professionalism and skill are unmatched.',
        },
        {
            id: '2',
            name: 'John Smith',
            designation: 'CTO at BetaCorp',
            image: 'https://randomuser.me/api/portraits/men/2.jpg',
            speech: 'Their attention to detail and commitment to quality really stood out. Highly recommended!',
        },
        {
            id: '3',
            name: 'Alice Johnson',
            designation: 'Product Owner at GammaTech',
            image: 'https://randomuser.me/api/portraits/women/3.jpg',
            speech: 'The collaboration was smooth, and the results exceeded our expectations. Truly excellent work!',
        },
    ]

    responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1,
        },
        {
            breakpoint: '1199px',
            numVisible: 2,
            numScroll: 1,
        },
        {
            breakpoint: '767px',
            numVisible: 1,
            numScroll: 1,
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1,
        },
    ]
}
