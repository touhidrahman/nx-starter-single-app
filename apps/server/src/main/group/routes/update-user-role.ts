import { createRoute } from '@hono/zod-openapi'
import { CREATED, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { usersGroupsTable } from '../../../core/db/schema'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty, zId } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zUpdateUserRole } from '../group.schema'

export const updateUserRoleRoute = createRoute({
    path: '/v1/groups/:id/update-user-role',
    method: 'post',
    tags: ['Group'],
    middleware: [checkToken, checkPermission(['role:assign'])] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateUserRole, 'User ID and Role'),
    },
    responses: {
        [CREATED]: ApiResponse(zEmpty, 'User Role updated successfully'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

// TODO: move to user folder, change path
export const updateUserRoleHandler: AppRouteHandler<
    typeof updateUserRoleRoute
> = async (c) => {
    const { id: groupId } = c.req.param()
    const { sub } = c.get('jwtPayload')
    const { userId, roleId } = c.req.valid('json')

    try {
        const [data] = await db
            .insert(usersGroupsTable)
            .values({
                groupId,
                userId,
                roleId,
            })
            .onConflictDoUpdate({
                target: [usersGroupsTable.groupId, usersGroupsTable.userId],
                set: { roleId },
            })
            .returning()

        await saveLog('user', userId, sub, 'update', {}, toJsonSafe(data))

        return c.json(
            { data: {}, message: 'User role updated', success: true },
            CREATED,
        )
    } catch (error) {
        return c.json(
            {
                message: 'Error adding user to group',
                error,
                data: {},
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
