export interface NewsTickerDto {
    title: string
    isActive: boolean
    tickerUrl: string
}
export interface NewsTicker extends NewsTickerDto {
    id: string
    createdAt: Date
    updatedAt: Date
}

export type NewsTickerFormDialogData = {
    newsTicker: NewsTicker | null
}

export type NewsTickerFormDialogResult = {
    newsTicker: NewsTicker | null
    isEdit: boolean
}
