import { createRouter } from '../../core/create-app'
import {
    getDashboardTotalCountsHandler,
    getDashboardTotalCountsRoute,
} from './routes/get-dashboard-total-counts'

export const dashboardV1Routes = createRouter().openapi(
    getDashboardTotalCountsRoute,
    getDashboardTotalCountsHandler,
)
