import { DashboardData } from './dashboard.schema'

export const getDashboardData = async (_groupId: string): Promise<DashboardData> => {
    try {
        return {
            activeCases: 0,
            archivedCases: 0,
            totalClients: 0,
            totalCases: 0,
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        throw new Error('Failed to fetch dashboard data')
    }
}
