import { createRouter } from '../../core/create-app'
import { acceptInviteHandler, acceptInviteRoute } from './routes/accept-invite'
import { createInviteHandler, createInviteRoute } from './routes/create-invite'
import {
    deleteInvitationHandler,
    deleteInvitationRoute,
} from './routes/delete-invite'
import { getInvitesHandler, getInvitesRoute } from './routes/get-inviteList'

export const invitesV1Route = createRouter()
    .openapi(acceptInviteRoute, acceptInviteHandler)
    .openapi(createInviteRoute, createInviteHandler)
    .openapi(getInvitesRoute, getInvitesHandler)
    .openapi(deleteInvitationRoute, deleteInvitationHandler)
