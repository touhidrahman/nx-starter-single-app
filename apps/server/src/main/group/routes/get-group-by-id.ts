import { createRoute, z } from '@hono/zod-openapi'
import { every, some } from 'hono/combine'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { isGroupOwner } from '../../../middlewares/is-group-owner.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectGroup } from '../group.schema'
import { findGroupById } from '../group.service'

export const getGroupByIDRoute = createRoute({
    path: '/groups/:id',
    method: 'get',
    tags: ['Group'],
    middleware: [every(checkToken, some(isAdmin, isGroupOwner))] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Group found'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
    },
})
export const getGroupByIdHandler: AppRouteHandler<
    typeof getGroupByIDRoute
> = async (c) => {
    const id = c.req.param('id')
    const result = await findGroupById(id)

    if (!result) {
        return c.json(
            {
                data: {},
                success: false,
                message: 'Group not found',
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: result,
            message: 'Group details',
            success: true,
        },
        OK,
    )
}
