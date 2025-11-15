import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { deleteInvitation, findInvitationById } from '../invite.service'

export const deleteInvitationRoute = createRoute({
    path: '/invites/:id',
    method: 'delete',
    tags: ['Invite'],
    middleware: [
        checkToken,
        checkPermission({ and: ['invite:write'] }),
    ] as const,
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Invitation deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Invitation not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteInvitationHandler: AppRouteHandler<
    typeof deleteInvitationRoute
> = async (c) => {
    const invitationId = c.req.param('id')
    const { sub } = c.get('jwtPayload')

    try {
        const invitationItem = await findInvitationById(invitationId)
        if (!invitationItem) {
            return c.json(
                {
                    data: {},
                    message: 'Invitation not found',
                    success: false,
                },
                NOT_FOUND,
            )
        }

        await deleteInvitation(invitationId)
        await saveLog(
            'invite',
            invitationId,
            sub,
            'delete',
            toJsonSafe(invitationItem),
            {},
        )

        return c.json(
            {
                data: {},
                message: 'Invitation deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Internal Server Error',
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
