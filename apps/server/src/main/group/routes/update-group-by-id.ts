import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isGroupOwner } from '../../../core/middlewares/is-group-owner.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectGroup, zUpdateGroup } from '../group.schema'
import { findGroupById, updateGroup } from '../group.service'

export const updateGroupByIdRoute = createRoute({
    path: '/v1/groups/:id',
    method: 'patch',
    tags: ['Group'],
    middleware: [checkToken, isGroupOwner] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zUpdateGroup, 'Group details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectGroup, 'Updated'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
    },
})

export const updateGroupHandler: AppRouteHandler<
    typeof updateGroupByIdRoute
> = async (c) => {
    const id = c.req.param('id')
    const { sub } = c.get('jwtPayload')
    const body = c.req.valid('json')
    const group = await findGroupById(id)
    const result = await updateGroup(id, body)

    if (result.length === 0) {
        return c.json(
            { message: 'Group not found', data: {}, success: false },
            NOT_FOUND,
        )
    }

    await saveLog(
        'group',
        id,
        sub,
        'update',
        toJsonSafe(group ?? {}),
        toJsonSafe(result),
    )

    return c.json(
        { data: result[0], message: 'Group updated', success: true },
        OK,
    )
}
