import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
    transform(
        value: number | null | undefined,
        unit = 'auto',
        decimals = 2,
    ): string {
        if (value == null || value === 0) {
            return '0 B'
        }

        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        const k = 1024

        if (unit === 'auto') {
            const i = Math.floor(Math.log(value) / Math.log(k))
            const size = value / k ** i
            return `${size.toFixed(decimals)} ${units[i]}`
        }

        const unitIndex = units.indexOf(unit.toUpperCase())
        if (unitIndex === -1) {
            return `${value.toFixed(decimals)} B`
        }

        const size = value / k ** unitIndex
        return `${size.toFixed(decimals)} ${units[unitIndex]}`
    }
}
