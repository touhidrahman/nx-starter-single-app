import { createRoute } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { some } from 'hono/combine'
import { BAD_REQUEST, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../db/db'
import { rolesTable } from '../../../db/schema'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectRole } from '../role.schema'

export const getRoleRoute = createRoute({
    path: '/roles/:id',
    method: 'get',
    tags: ['Role'],
    middleware: [
        checkToken,
        some(checkPermission(['role:read']), isAdmin),
    ] as const,
    params: zId,
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Role fetched successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid role data'),
    },
})

export const getRoleHandler: AppRouteHandler<typeof getRoleRoute> = async (
    c,
) => {
    const id = c.req.param('id')

    const [role] = await db
        .select()
        .from(rolesTable)
        .where(eq(rolesTable.id, id))

    if (!role) {
        return c.json(
            {
                data: {},
                message: 'Role not found',
                success: false,
            },
            BAD_REQUEST,
        )
    }

    return c.json(
        {
            data: role,
            message: 'Role fetched successfully',
            success: true,
        },
        OK,
    )
}
