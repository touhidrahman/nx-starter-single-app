import { createRoute } from '@hono/zod-openapi'
import { uniq } from 'es-toolkit'
import { some } from 'hono/combine'
import {
    BAD_REQUEST,
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler, SystemUserLevel } from '../../../core/core.type'
import { checkPermission } from '../../../core/middlewares/check-permission.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectRole, zUpdateRole } from '../role.schema'
import { findRoleById, updateRole } from '../role.service'

export const updateRoleRoute = createRoute({
    path: '/v1/roles/:id',
    method: 'patch',
    tags: ['Role'],
    middleware: [
        checkToken,
        some(checkPermission(['role:write']), isAdmin),
    ] as const,
    params: zId,
    request: {
        body: jsonContent(zUpdateRole, 'Role details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectRole, 'Role updated successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid role data'),
        [FORBIDDEN]: ApiResponse(zEmpty, 'Access to the resource is forbidden'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})

export const updateRoleHandler: AppRouteHandler<
    typeof updateRoleRoute
> = async (c) => {
    const id = c.req.param('id')
    const { sub, level } = c.get('jwtPayload')
    const body = c.req.valid('json')

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
                    message: 'System defined role is not editable.',
                    success: false,
                },
                FORBIDDEN,
            )
        }

        const mergedSortedClaims = uniq(body.claims || []).sort()

        const allowUpdateSystemRole = level === SystemUserLevel.ADMIN
        const role = await updateRole(
            id,
            {
                ...body,
                claims: mergedSortedClaims,
            },
            allowUpdateSystemRole,
        )

        await saveLog(
            'roles',
            id,
            sub,
            'update',
            toJsonSafe(exists),
            toJsonSafe(role),
        )

        return c.json(
            {
                data: role,
                message: 'Role updated successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to update role',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
