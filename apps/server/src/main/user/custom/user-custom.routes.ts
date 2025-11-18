import { createRouter } from '../../../core/create-app'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'

const tags = [APP_OPENAPI_TAGS.User]
const path = '/custom/users'

export const userCustomRoutes = createRouter()
