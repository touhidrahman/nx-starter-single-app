import { createRouter } from '../../../core/create-app'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'

const tags = [APP_OPENAPI_TAGS.ACCOUNT]
const path = '/main/accounts'

export const accountCustomRoutes = createRouter()
