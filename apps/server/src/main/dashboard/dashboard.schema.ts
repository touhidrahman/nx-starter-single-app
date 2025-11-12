import { z } from 'zod'

export const dashboardDataSchema = z.object({
    activeCases: z.number(),
    archivedCases: z.number(),
    totalClients: z.number(),
    totalCases: z.number(),
})

export type DashboardData = z.infer<typeof dashboardDataSchema>
