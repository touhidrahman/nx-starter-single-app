import { transactionScheduleCoreRoutes } from './transaction-schedule-core.routes'
import { transactionScheduleCrudRoutes } from './transaction-schedule-crud.routes'
import { transactionScheduleCustomRoutes } from './transaction-schedule-custom.routes'

export const transactionScheduleRoutes = [
    transactionScheduleCustomRoutes,
    transactionScheduleCrudRoutes,
    transactionScheduleCoreRoutes,
]
