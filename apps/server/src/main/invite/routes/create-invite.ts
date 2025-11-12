import { createRoute } from '@hono/zod-openapi'
import { some } from 'hono/combine'
import { FORBIDDEN, INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import env from '../../../env'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { generateInvitationToken } from '../../auth/token.util'
import { buildInviteUserEmailTemplate } from '../../email/templates/invite-user'
import { findGroupById } from '../../group/group.service'
import { zCreateInvite, zSelectInvite } from '../invite.schema'
import { checkGroupLimit, createInvite } from '../invite.service'

export const createInviteRoute = createRoute({
    path: '/v1/invites',
    method: 'post',
    tags: ['Invite'],
    middleware: [
        checkToken,
        some(checkPermission(['invite:write']), isAdmin),
    ] as const,
    request: {
        body: jsonContent(zCreateInvite, 'Invite details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectInvite, 'Create Invite successfully!'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Limit invitation reached!'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Server error'),
    },
})

export const createInviteHandler: AppRouteHandler<
    typeof createInviteRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')

    try {
        const group = await findGroupById(body.groupId)

        const limitCheck = await checkGroupLimit(body.groupId, {
            countSource: 'both',
        })

        if (!limitCheck.canAdd) {
            return c.json(
                {
                    data: {
                        currentUsers: limitCheck.currentUsers,
                        maxUsers: limitCheck.maxUsers,
                    },
                    message: limitCheck.message || 'Group user limit reached',
                    success: false,
                },
                FORBIDDEN,
            )
        }

        const [invite] = await createInvite(body, payload.sub)

        const inviteToken = await generateInvitationToken({
            userEmail: invite.email,
            organizationId: invite.groupId,
            organizationName: group?.name ?? '',
            roleId: invite.roleId ?? '',
            invitationId: invite.id,
        })

        const { data, error } = await sendInviteEmail(
            invite.email,
            group?.name ?? '',
            inviteToken,
        )

        await saveLog(
            'invite',
            invite?.id ?? '',
            payload.sub,
            'create',
            {},
            toJsonSafe(invite),
        )

        return c.json(
            {
                data: invite,
                message: 'Invite has been successful!',
                success: true,
            },
            OK,
        )
    } catch (e) {
        return c.json(
            {
                data: {},
                message: 'Invite has been unsuccessful!',
                success: false,
                error: e,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}

async function sendInviteEmail(
    email: string,
    groupName: string,
    inviteToken: string,
) {
    const template = buildInviteUserEmailTemplate({
        organizationName: groupName,
        invitationUrl: `${env.FRONTEND_URL}/accept?token=${inviteToken}`,
    })

    return sendEmailUsingResend([email], 'You have been invited!', template)
}
