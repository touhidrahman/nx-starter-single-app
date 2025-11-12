import { Pipe, PipeTransform } from '@angular/core'
import { toInt } from 'radash'

@Pipe({ name: 'isClickable' })
export class IsClickablePipe implements PipeTransform {
    transform(value: number | null | undefined): boolean {
        return toInt(value, 0) > 0
    }
}
