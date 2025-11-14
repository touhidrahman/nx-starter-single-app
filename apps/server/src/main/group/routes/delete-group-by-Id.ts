import { createRoute } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { resetDefaultGroupId } from '../../user/user.service'
import {
    deleteGroupWithOwner,
    findGroupById,
    removeAllGroupMembers,
    removeGroupOwner,
} from '../group.service'

export const deleteGroupByIdRoute = createRoute({
    path: '/v1/groups/:id',
    method: 'delete',
    tags: ['Group'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Deleted'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Group not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Group not found'),
    },
})

export const deleteGroupHandler: AppRouteHandler<
    typeof deleteGroupByIdRoute
> = async (c) => {
    const id = c.req.param('id')
    const { sub } = c.get('jwtPayload')
    const result = await findGroupById(id)

    try {
        if (!result) {
            return c.json(
                {
                    message: 'Group not found',
                    success: false,
                    data: {},
                },
                NOT_FOUND,
            )
        }

        await removeGroupOwner(id)
        await removeAllGroupMembers(id)
        await resetDefaultGroupId(id)

        const data = await deleteGroupWithOwner(id)

        await saveLog(
            'groups',
            result.id ?? null,
            sub,
            'delete',
            toJsonSafe(data),
            {},
        )

        return c.json(
            {
                data: '',
                message: 'Group deleted',
                success: true,
            },
            OK,
        )
    } catch (error) {
        c.var.logger.error((error as Error)?.stack ?? error)
        return c.json(
            {
                data: {},
                message: 'Internal Server Error',
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
