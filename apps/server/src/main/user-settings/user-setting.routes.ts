import { createRouter } from '../../core/create-app'
import {
    getUserSettingsRoute,
    getUsersSettingsHandler,
} from './routes/get-user-setting'
import {
    userSettingsHandler,
    userSettingsRoute,
} from './routes/update-user-setting'

export const userSettingsV1Routes = createRouter()
    .openapi(userSettingsRoute, userSettingsHandler)
    .openapi(getUserSettingsRoute, getUsersSettingsHandler)
