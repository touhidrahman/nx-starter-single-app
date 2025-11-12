export interface HomeData {
    activeCases: number
    archivedCases: number
    totalClients: number
    totalCases: number
}
export interface DashboardHomeData {
    label: string
    value: number
    icon: string
    color: string
    url?: string
    queryParams?: unknown
}

export interface BalanceData {
    balance: string
    validity: string
}
