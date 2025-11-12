import { createRouter } from '../../core/create-app'
import { createInviteHandler, createInviteRoute } from './routes/create-invite'
import {
    deleteInvitationHandler,
    deleteInvitationRoute,
} from './routes/delete-invite'
import { getInvitesHandler, getInvitesRoute } from './routes/get-inviteList'

export const invitesV1Route = createRouter()
    .openapi(createInviteRoute, createInviteHandler)
    .openapi(getInvitesRoute, getInvitesHandler)
    .openapi(deleteInvitationRoute, deleteInvitationHandler)
