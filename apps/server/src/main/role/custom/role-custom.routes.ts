import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkPermission } from '../../../middlewares/check-permission.middleware'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { APP_OPENAPI_TAGS } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryRoles, zSelectRole } from '../core/role-core.model'
import { RoleCustomService } from './role-custom.service'

const tags = [APP_OPENAPI_TAGS.Role]
const path = '/custom/roles'

const GetMyRoleListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: 'get',
    middleware: [checkToken, checkPermission(['Role:Read'])] as const,
    request: {
        query: zQueryRoles,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectRole), 'Role List'),
    },
})

const GetRoleListCrud: AppRouteHandler<typeof GetMyRoleListDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload

    const groupSpecificQuery = { ...query, groupId }
    const data = await RoleCustomService.findMany(groupSpecificQuery)
    const count = await RoleCustomService.count(groupSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Role list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const roleCustomRoutes = createRouter().openapi(GetMyRoleListDef, GetRoleListCrud)
