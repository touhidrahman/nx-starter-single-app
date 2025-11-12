import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import env from '../../../env'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import {
    buildActiveStatusEmailTemplate,
    buildInactiveStatusEmailTemplate,
} from '../../email/templates/group-status-update'
import { User } from '../../user/user.schema'
import { findUserById } from '../../user/user.service'
import { Group, zSelectGroup, zUpdateGroupStatus } from '../group.schema'
import { findGroupById, updateGroupStatus } from '../group.service'

export const updateGroupStatusRoute = createRoute({
    path: '/v1/groups/update-status/:id',
    method: 'put',
    tags: ['Group'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zUpdateGroupStatus, 'Group details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Updated'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
    },
})

export const updateGroupStatusHandler: AppRouteHandler<
    typeof updateGroupStatusRoute
> = async (c) => {
    const id = c.req.param('id')
    const { sub } = c.get('jwtPayload')
    const body = c.req.valid('json')
    const existingGroup = await findGroupById(id)
    if (!existingGroup) {
        return c.json(
            {
                data: {},
                message: 'Group not found',
                success: false,
            },
            NOT_FOUND,
        )
    }
    const [result] = await updateGroupStatus(id, body)

    const groupOwner = await findUserById(existingGroup.ownerId)

    if (groupOwner) {
        await sendGroupStatusUpdateEmail(groupOwner, {
            ...existingGroup,
            status: body.status,
        })
    }

    await saveLog(
        'group',
        id,
        sub,
        'update',
        toJsonSafe(existingGroup),
        toJsonSafe(result),
    )

    return c.json(
        {
            data: result,
            message: 'Group updated',
            success: true,
        },
        OK,
    )
}

async function sendGroupStatusUpdateEmail(user: User, group: Group) {
    let subject = ''
    let template = ''

    switch (group.status) {
        case 'active':
            subject = 'Your Organization Has Been Activated'
            template = buildActiveStatusEmailTemplate({
                recipientName: `${user.firstName} ${user.lastName}`,
                organizationName: group.name,
                url: `${env.FRONTEND_URL}/login`,
            })
            break
        case 'inactive':
            subject = 'Your Organization Has Been Deactivated'
            template = buildInactiveStatusEmailTemplate({
                recipientName: `${user.firstName} ${user.lastName}`,
                organizationName: group.name,
                url: `${env.FRONTEND_URL}/login`,
            })
            break
        case 'pending':
            return
    }

    const { data, error } = await sendEmailUsingResend(
        [user.email ?? ''],
        subject,
        template,
    )

    if (error) {
        throw new Error(`Failed to send status update email: ${error.message}`)
    }
}
