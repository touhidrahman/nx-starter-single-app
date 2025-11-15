import { createRoute, z } from '@hono/zod-openapi'
import { every, some } from 'hono/combine'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { changeUserRole } from '../user.service'

export const changeUserRoleRoute = createRoute({
    path: '/users/:id/role',
    method: 'put',
    tags: ['User'],
    middleware: [
        every(
            checkToken,
            some(isAdmin, checkPermission({ and: ['role:write'] })),
        ),
    ] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zId, 'Role ID'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                userId: z.string(),
                groupId: z.string(),
                roleId: z.string().nullable(),
            }),
            'Updated',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'User not found'),
    },
})

export const changeUserRoleHandler: AppRouteHandler<
    typeof changeUserRoleRoute
> = async (c) => {
    const body = c.req.valid('json')
    const userId = c.req.param('id')
    const { sub } = c.get('jwtPayload')

    const updatedUser = await changeUserRole(userId, body.id)

    if (!updatedUser) {
        return c.json(
            { data: {}, message: 'User not found', success: false },
            NOT_FOUND,
        )
    }

    await saveLog(
        'user',
        userId,
        sub,
        'update',
        {},
        toJsonSafe(updatedUser ?? {}),
    )

    return c.json(
        {
            data: updatedUser,
            message: 'User role changed',
            success: true,
        },
        OK,
    )
}
