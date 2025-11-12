import { Pipe, PipeTransform } from '@angular/core'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

@Pipe({ name: 'utcDate' })
export class UtcDatePipe implements PipeTransform {
    transform(
        value: Date | string | number | null | undefined,
        formatStr = 'mediumDate',
    ): string {
        if (!value) return ''

        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ''

        const formatMap: Record<string, string> = {
            mediumDate: 'MMM d, yyyy',
            shortDate: 'd/M/yy',
            fullDate: 'PPPP',
        }

        const pattern = formatMap[formatStr] || formatStr
        const utcDate = toZonedTime(date, 'UTC')
        return format(utcDate, pattern)
    }
}
