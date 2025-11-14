import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectUser } from '../../user/user.schema'
import { findUserById } from '../../user/user.service'
import { addUserToGroup, isParticipant } from '../group.service'

export const addUserToGroupRoute = createRoute({
    path: '/v1/groups/:id/add-user',
    method: 'post',
    tags: ['Group'],
    middleware: [checkToken, isGroupOwner] as const,
    request: {
        body: jsonContent(z.object({ userId: z.string() }), 'Group Detail'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectUser, 'User added to group successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid group data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})
export const addUserToGroupHandler: AppRouteHandler<
    typeof addUserToGroupRoute
> = async (c) => {
    const groupId = c.req.param('id')
    const { userId } = c.req.valid('json')
    const { sub, roleId } = c.get('jwtPayload')

    try {
        const user = await findUserById(userId)

        if (!user) {
            return c.json(
                { data: {}, success: false, message: 'User not found' },
                NOT_FOUND,
            )
        }

        const exists = await isParticipant(user.id, groupId)
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

        //TODO:Here missing roleID
        // add user to group
        const data = await addUserToGroup(user.id, groupId, roleId)

        await saveLog('user', data.userId, sub, 'create', {}, toJsonSafe(data))

        return c.json(
            {
                data: user,
                success: true,
                message: 'User added to group',
            },
            CREATED,
        )
    } catch (error) {
        return c.json(
            {
                message: 'Error adding user to group',
                data: {},
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
