import { createRouter } from '../../../core/create-app'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'

const tags = [APP_OPENAPI_TAGS.Transaction]
const path = '/custom/transactions'

export const transactionCustomRoutes = createRouter()
