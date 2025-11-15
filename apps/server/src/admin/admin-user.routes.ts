import { createRouter } from '../core/create-app'
import { adminLoginHandler, adminLoginRoute } from './routes/admin-login'

export const adminUserV1Routes = createRouter().openapi(
    adminLoginRoute,
    adminLoginHandler,
)
