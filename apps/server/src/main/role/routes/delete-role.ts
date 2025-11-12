import { createRoute } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { some } from 'hono/combine'
import {
    BAD_REQUEST,
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { rolesTable } from '../../../core/db/schema'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectRole } from '../role.schema'
import { findRoleById } from '../role.service'

export const deleteRoleRoute = createRoute({
    path: '/v1/roles/:id',
    method: 'delete',
    tags: ['Role'],
    middleware: [
        checkToken,
        some(checkPermission(['role:delete']), isAdmin),
    ] as const,
    params: zId,
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Role deleted successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid role data'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Access to the resource is forbidden'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})

export const deleteRoleHandler: AppRouteHandler<
    typeof deleteRoleRoute
> = async (c) => {
    const id = c.req.param('id')
    const { sub } = c.get('jwtPayload')

    try {
        const [exists] = await findRoleById(id)

        if (!exists) {
            return c.json(
                {
                    data: {},
                    message: 'Role not found.',
                    success: false,
                },
                BAD_REQUEST,
            )
        }
        if (exists.isSystemRole) {
            return c.json(
                {
                    data: {},
                    message: 'Default role cannot be deleted.',
                    success: false,
                },
                FORBIDDEN,
            )
        }

        const [deletedRole] = await db
            .delete(rolesTable)
            .where(eq(rolesTable.id, id))
            .returning()

        await saveLog(
            'roles',
            deletedRole.id,
            sub,
            'delete',
            toJsonSafe(deletedRole),
            {},
        )

        return c.json(
            {
                data: deletedRole,
                message: 'Role deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to delete role',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
