import { createRouter } from '../../core/create-app'
import {
    changeUserRoleHandler,
    changeUserRoleRoute,
} from './routes/change-user-role'
import { deleteUserHandler, deleteUserRoute } from './routes/delete-user'
import { getMeHandler, getMeRoute } from './routes/get-me'
import { getUserHandler, getUserRoute } from './routes/get-user'
import { getUsersHandler, getUsersRoute } from './routes/get-users'
import {
    getUsersByGroupIdHandler,
    getUsersByGroupIdRoute,
} from './routes/get-users-by-group-id'
import { inviteUserHandler, inviteUserRoute } from './routes/invite-user'
import {
    updateUserProfileHandler,
    updateUserProfileRoute,
} from './routes/update-profile'
import { updateUserHandler, updateUserRoute } from './routes/update-user'
import {
    updateUserProfilePictureHandler,
    updateUserProfilePictureRoute,
} from './routes/upload-profile-picture'

export const userV1Routes = createRouter()
    .openapi(changeUserRoleRoute, changeUserRoleHandler)
    .openapi(getMeRoute, getMeHandler)
    .openapi(inviteUserRoute, inviteUserHandler)
    .openapi(deleteUserRoute, deleteUserHandler)
    .openapi(getUsersRoute, getUsersHandler)
    .openapi(updateUserProfilePictureRoute, updateUserProfilePictureHandler)
    .openapi(updateUserProfileRoute, updateUserProfileHandler)
    .openapi(updateUserRoute, updateUserHandler)
    .openapi(getUserRoute, getUserHandler)
    .openapi(getUsersByGroupIdRoute, getUsersByGroupIdHandler)
