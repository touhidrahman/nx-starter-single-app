import { transactionScheduleCoreRoutes } from './transaction-schedule-core.controller'
import { transactionScheduleCrudRoutes } from './transaction-schedule-crud.controller'
import { transactionScheduleCustomRoutes } from './transaction-schedule-custom.controller'

export const transactionScheduleRoutes = [
    transactionScheduleCustomRoutes,
    transactionScheduleCrudRoutes,
    transactionScheduleCoreRoutes,
]
