import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { findGroupById } from '../../group/group.service'
import { zSelectUserWithoutPass } from '../user.schema'
import { getUsersByGroupId } from '../user.service'

export const getUsersByGroupIdRoute = createRoute({
    //TODO : group/:id/users
    path: '/v1/users/group-user/:id',
    method: 'get',
    tags: ['User'],
    //TODO : Add User Claim - user:read
    middleware: [checkToken] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectUserWithoutPass), 'List of Users'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const getUsersByGroupIdHandler: AppRouteHandler<
    typeof getUsersByGroupIdRoute
> = async (c) => {
    //! TODO: check here valid user or not
    const groupId = c.req.param('id')

    const group = await findGroupById(groupId)
    if (!group) {
        return c.json(
            {
                data: {},
                message: 'Group not found',
                success: false,
                error: 'Group not found',
                meta: null,
            },
            NOT_FOUND,
        )
    }

    const users = await getUsersByGroupId(groupId)

    return c.json(
        {
            data: users,
            message: 'List of users',
            success: true,
            error: null,
            meta: null,
        },
        OK,
    )
}
