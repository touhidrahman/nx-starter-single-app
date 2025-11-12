import { createRouter } from '../../core/create-app'
import {
    getUsersSettingByUserIdRoute,
    getUsersSettingsByUserIdHandler,
} from './routes/get-user-setting-by-userId'
import {
    userSettingsHandler,
    userSettingsRoute,
} from './routes/update-user-setting'

export const userSettingsV1Routes = createRouter()
    .openapi(userSettingsRoute, userSettingsHandler)

    .openapi(getUsersSettingByUserIdRoute, getUsersSettingsByUserIdHandler)
