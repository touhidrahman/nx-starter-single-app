import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'textSlice' })
export class TextSlicePipe implements PipeTransform {
    transform(
        value: string | null | undefined,
        limit = 100,
        ellipsis = '...',
        preserveWords = true,
    ): string {
        if (!value) return ''
        if (value.length <= limit) return value

        if (preserveWords) {
            const lastSpace = value.slice(0, limit).lastIndexOf(' ')
            return lastSpace > 0
                ? `${value.slice(0, lastSpace)}${ellipsis}`
                : `${value.slice(0, limit)}${ellipsis}`
        }

        return `${value.slice(0, limit)}${ellipsis}`
    }
}
