export function convertDateToUTCMidnight(date: string | Date): Date {
    const local = new Date(date)
    return new Date(
        Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()),
    )
}
