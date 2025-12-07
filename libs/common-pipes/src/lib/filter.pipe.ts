import { Pipe, PipeTransform } from '@angular/core'

//! TODO: old version

// @Pipe({
//     name: 'filter',
//     standalone: true,
// })
// export class FilterPipe<T> implements PipeTransform {
//     transform(items: T[], filter: Record<string, T>): T[] {
//         if (!items || !filter) {
//             return items
//         }

//         const key = Object.keys(filter)[0]
//         const value = filter[key]

//         return items.filter((e) => e[key].indexOf(value) !== -1)
//     }
// }

@Pipe({
    name: 'filter',
    standalone: true,
})
export class FilterPipe<T extends Record<string, any>> implements PipeTransform {
    transform(items: T[] | null | undefined, filter: Partial<T>): T[] {
        if (!items || !filter || Object.keys(filter).length === 0) {
            return items || []
        }

        return items.filter((item) => {
            return Object.entries(filter).every(([key, value]) => {
                if (value === undefined || value === null) return true
                if (typeof item[key] === 'string' && typeof value === 'string') {
                    return item[key].toLowerCase().includes(value.toLowerCase())
                }
                return item[key] === value
            })
        })
    }
}
