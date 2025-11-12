import { isFuture, startOfDay } from 'date-fns'

export function isFutureDate(date: Date | string | number): boolean {
    return isFuture(startOfDay(new Date(date)))
}
