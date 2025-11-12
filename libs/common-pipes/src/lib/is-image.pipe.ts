import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'isImage' })
export class IsImagePipe implements PipeTransform {
    transform(filename: string): boolean {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']
        const extension = filename.split('.').pop()?.toLowerCase() || ''
        return imageExtensions.includes(extension)
    }
}
