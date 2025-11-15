import { createRouter } from '../../../core/create-app'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'

const tags = [APP_OPENAPI_TAGS.Admin]
const path = '/custom/admins'

export const adminCustomRoutes = createRouter()
