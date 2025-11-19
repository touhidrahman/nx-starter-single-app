import { createRoute } from '@hono/zod-openapi'
import { some } from 'hono/combine'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zInsertRole, zSelectRole } from '../role.schema'
import { createRole } from '../role.service'

export const createRoleRoute = createRoute({
    path: '/roles',
    method: 'post',
    tags: ['Role'],
    middleware: [
        checkToken,
        some(checkPermission(['role:write']), isAdmin),
    ] as const,
    request: {
        body: jsonContent(zInsertRole, 'Role details'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectRole, 'Role created successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid role data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})

export const createRoleHandler: AppRouteHandler<
    typeof createRoleRoute
> = async (c) => {
    const body = c.req.valid('json')
    const { sub } = c.get('jwtPayload')
    const { name, description, groupId, permissions } = body

    try {
        const permissionsSorted = (permissions ?? '')?.split(',')

        const newRole = await createRole(
            groupId as string,
            name ?? '',
            description as string,
            permissionsSorted,
        )

        await saveLog(
            'roles',
            newRole.id,
            sub,
            'create',
            {},
            toJsonSafe(newRole),
        )
        return c.json(
            {
                data: newRole,
                message: 'Role created successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to create role',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
