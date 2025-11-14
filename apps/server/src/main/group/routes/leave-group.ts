import { createRoute, z } from '@hono/zod-openapi'
import { and, eq } from 'drizzle-orm'
import { BAD_REQUEST, CREATED } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../db/db'
import { membershipsTable } from '../../../db/schema'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isGroupParticipant } from '../../../middlewares/is-group-participant.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'

export const leaveGroupRoute = createRoute({
    path: '/v1/groups/:id/leave',
    method: 'delete',
    tags: ['Group'],
    middleware: [checkToken, isGroupParticipant] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [CREATED]: ApiResponse(zEmpty, 'User deleted from group successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid group data'),
    },
})
export const leaveGroupHandler: AppRouteHandler<
    typeof leaveGroupRoute
> = async (c) => {
    const id = c.req.param('id')
    const { userId } = await c.get('jwtPayload')

    const [user] = await db
        .delete(membershipsTable)
        .where(
            and(
                eq(membershipsTable.groupId, id),
                eq(membershipsTable.userId, userId),
            ),
        )
        .returning()
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

    return c.json(
        { data: {}, message: 'User removed from group', success: true },
        CREATED,
    )
}
