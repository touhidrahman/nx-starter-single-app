import { createRouter } from '../core/create-app'
import { adminLoginHandler, adminLoginRoute } from './routes/admin-login'
import {
    createAdminHandler,
    createAdminRoute,
} from './routes/create-admin-user'
import {
    createFirstAdminHandler,
    createFirstAdminRoute,
} from './routes/create-first-admin'
import { getAdminUserHandler, getAdminUserRoute } from './routes/get-admin-user'
import {
    getAdminUsersHandler,
    getAdminUsersRoute,
} from './routes/get-admin-users'
import {
    updateAdminUserHandler,
    updateAdminUserRoute,
} from './routes/update-admin-user'

export const adminUserV1Routes = createRouter()
    .openapi(createAdminRoute, createAdminHandler)
    .openapi(getAdminUserRoute, getAdminUserHandler)
    .openapi(getAdminUsersRoute, getAdminUsersHandler)
    .openapi(updateAdminUserRoute, updateAdminUserHandler)
    .openapi(adminLoginRoute, adminLoginHandler)
    .openapi(createFirstAdminRoute, createFirstAdminHandler)
