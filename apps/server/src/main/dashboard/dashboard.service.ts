import { and, count, eq } from 'drizzle-orm'
import { db } from '../../core/db/db'
import { DashboardData, dashboardDataSchema } from './dashboard.schema'

export const getDashboardData = async (
    groupId: string,
): Promise<DashboardData> => {
    try {
        // const [activeCases, archivedCases, totalClients, totalCases] =
        //     await Promise.all([
        //         db
        //             .select({ count: count() })
        //             .from(casesTable)
        //             .where(
        //                 and(
        //                     eq(casesTable.groupId, groupId),
        //                     eq(casesTable.caseStatus, 'active'),
        //                 ),
        //             ),

        //         db
        //             .select({ count: count() })
        //             .from(casesTable)
        //             .where(
        //                 and(
        //                     eq(casesTable.groupId, groupId),
        //                     eq(casesTable.caseStatus, 'archived'),
        //                 ),
        //             ),

        //         db
        //             .select({ count: count() })
        //             .from(clientsTable)
        //             .where(eq(clientsTable.groupId, groupId)),

        //         db
        //             .select({ count: count() })
        //             .from(casesTable)
        //             .where(eq(casesTable.groupId, groupId)),
        //     ])

        // return dashboardDataSchema.parse({
        //     activeCases: activeCases[0]?.count ?? 0,
        //     archivedCases: archivedCases[0]?.count ?? 0,
        //     totalClients: totalClients[0]?.count ?? 0,
        //     totalCases: totalCases[0]?.count ?? 0,
        // })
        //
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
