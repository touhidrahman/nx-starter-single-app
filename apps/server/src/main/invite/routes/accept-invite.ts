import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CONFLICT,
    INTERNAL_SERVER_ERROR,
    MOVED_TEMPORARILY,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { findUserByEmail } from '../../auth/auth.service'
import { decodeInvitationToken } from '../../auth/token.util'
import {
    addUserToGroup,
    findGroupById,
    isParticipant,
    setDefaultGroup,
} from '../../group/group.service'
import {
    checkGroupLimit,
    findInvitationById,
    updateInviteStatus,
} from '../invite.service'

export const acceptInviteRoute = createRoute({
    path: '/v1/invites/accept',
    method: 'post',
    tags: ['Invite'],
    request: {
        body: jsonContent(z.object({ token: z.string() }), 'Invite token'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({ redirect: z.boolean() }),
            'Invite accepted',
        ),
        [MOVED_TEMPORARILY]: ApiResponse(
            z.object({ redirect: z.boolean() }),
            'Redirecting to signup',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid token!'),
        [CONFLICT]: ApiResponse(
            zEmpty,
            'This user is already accepted invitation!',
        ),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Server error'),
    },
})

export const acceptInviteHandler: AppRouteHandler<
    typeof acceptInviteRoute
> = async (c) => {
    const { token } = c.req.valid('json')

    try {
        const decoded = await decodeInvitationToken(token)

        if (!decoded) {
            return c.json(
                {
                    data: {},
                    message: 'Invalid token!',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const group = await findGroupById(decoded.organizationId)
        if (group?.type === 'vendor') {
            const limitCheck = await checkGroupLimit(decoded.organizationId, {
                countSource: 'users',
            })
            if (!limitCheck.canAdd) {
                return c.json(
                    {
                        data: { redirect: false, url: '' },
                        message:
                            limitCheck.message || 'Group user limit reached',
                        error: limitCheck.message,
                        success: false,
                    },
                    BAD_REQUEST,
                )
            }
        }

        const invite = await findInvitationById(decoded.invitationId)
        if (!invite) {
            return c.json(
                {
                    data: {},
                    message: 'Invitation not found!',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const user = await findUserByEmail(decoded.userEmail)
        if (!user) {
            // User not found, redirect to signup
            return c.json(
                {
                    data: { redirect: true, url: '/signup' },
                    message: 'User not found, redirecting to signup',
                    success: false,
                },
                MOVED_TEMPORARILY,
            )
        }

        const exists = await isParticipant(user.id, decoded.organizationId)
        if (exists) {
            return c.json(
                {
                    data: {},
                    success: false,
                    message: 'User already belongs to group',
                },
                BAD_REQUEST,
            )
        }

        await addUserToGroup(user.id, decoded.organizationId, decoded.roleId)
        await setDefaultGroup(user.id, decoded.organizationId)
        await updateInviteStatus(decoded.invitationId, 'accepted')

        await saveLog(
            'invite',
            invite?.id ?? '',
            user.id,
            'create',
            {},
            toJsonSafe(invite ?? {}),
        )

        return c.json(
            {
                data: { redirect: false },
                message: 'Invite accepted!',
                success: true,
            },
            OK,
        )
    } catch (e) {
        return c.json(
            {
                data: {},
                message: 'Invite acceptance was unsuccessful!',
                success: false,
                error: e,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
