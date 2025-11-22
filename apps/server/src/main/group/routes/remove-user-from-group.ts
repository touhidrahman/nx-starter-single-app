import { createRoute, z } from '@hono/zod-openapi'
import { some } from 'hono/combine'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { removeUserFromGroup } from '../group.service'

export const removeUserFromGroupRoute = createRoute({
    path: '/groups/:id/remove-user/:userId',
    method: 'delete',
    tags: ['Group'],
    middleware: [checkToken, some(isAdmin, isGroupOwner)] as const,
    request: {
        params: z.object({ id: z.string(), userId: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'User deleted from group successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid group data'),
    },
})

export const removeUserFromGroupHandler: AppRouteHandler<
    typeof removeUserFromGroupRoute
> = async (c) => {
    const id = c.req.param('id')
    const userId = c.req.param('userId')
    const { sub } = c.get('jwtPayload')
    const user = await findUserById(userId)

    if (!user) {
        return c.json(
            {
                message: 'User does not belong to group',
                data: {},
                success: false,
            },
            BAD_REQUEST,
        )
    }

    await removeUserFromGroup(userId, id)

    return c.json(
        {
            data: user.id,
            message: 'User removed from group',
            success: true,
        },
        OK,
    )
}
