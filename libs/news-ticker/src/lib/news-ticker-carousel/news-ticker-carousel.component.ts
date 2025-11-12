import { Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TextSlicePipe } from '@repo/common-pipes'
import { PrimeModules } from '@repo/prime-modules'
import { NewsTicker } from '../news-ticker.model'

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-news-ticker-carousel',
    imports: [PrimeModules, RouterLink, TextSlicePipe],
    templateUrl: './news-ticker-carousel.component.html',
    styleUrl: './news-ticker-carousel.component.scss',
})
export class NewsTickerCarouselComponent {
    newsTicker = input<NewsTicker[]>([])
    isNewsTickerVisible = output<boolean>()

    onNewsTickerClose() {
        this.isNewsTickerVisible.emit(false)
    }
}
