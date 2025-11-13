import { createRoute, z } from '@hono/zod-openapi'
import { some } from 'hono/combine'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkGroupId } from '../../../core/middlewares/check-groupId.middleware'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectRole } from '../role.schema'
import { findRoles } from '../role.service'

export const listRolesRoute = createRoute({
    path: '/v1/roles',
    method: 'get',
    tags: ['Role'],
    middleware: [
        checkToken,
        checkGroupId,
        some(checkPermission({ and: ['role:read'] }), isAdmin),
    ] as const,
    responses: {
        [OK]: ApiResponse(z.array(zSelectRole), 'List of Roles'),
    },
})

export const listRolesHandler: AppRouteHandler<typeof listRolesRoute> = async (
    c,
) => {
    const groupId = c.get('groupId') // set by checkGroupId middleware

    if (!groupId) {
        throw new HTTPException(BAD_REQUEST, {
            message: 'Group ID is missing in request context',
        })
    }

    const roles = await findRoles(groupId)

    return c.json(
        {
            data: roles,
            message: 'Roles fetched successfully',
            success: true,
        },
        OK,
    )
}
