import { Injectable, inject } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'

@Injectable({
    providedIn: 'root',
})
export class SeoService {
    private title = inject(Title)
    private meta = inject(Meta)

    updateMetaData(config: {
        title?: string
        description?: string
        keywords?: string
        robots?: string
        ogTitle?: string
        ogDescription?: string
        ogUrl?: string
        ogImage?: string
    }) {
        if (config.title) {
            this.title.setTitle(config.title)
            this.meta.updateTag({ name: 'og:title', content: config.title })
        }
        if (config.description) {
            this.meta.updateTag({
                name: 'description',
                content: config.description,
            })
            this.meta.updateTag({
                name: 'og:description',
                content: config.description,
            })
        }
        if (config.keywords) {
            this.meta.updateTag({ name: 'keywords', content: config.keywords })
        }
        if (config.robots) {
            this.meta.updateTag({ name: 'robots', content: config.robots })
        }
        if (config.ogUrl) {
            this.meta.updateTag({ name: 'og:url', content: config.ogUrl })
        }
        if (config.ogImage) {
            this.meta.updateTag({ name: 'og:image', content: config.ogImage })
        }
    }
}
