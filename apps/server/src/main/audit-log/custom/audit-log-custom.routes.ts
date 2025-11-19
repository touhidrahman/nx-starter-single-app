import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmptyList } from '../../../models/common.schema'
import { APP_OPENAPI_TAGS, REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse, ApiResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryAuditLogs, zSelectAuditLog } from '../core/audit-log-core.model'
import { AuditLogCustomService } from './audit-log-custom.service'

const tags = [APP_OPENAPI_TAGS.AuditLog]
const path = '/custom/audit-logs'

const GetMyAuditLogListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryAuditLogs,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectAuditLog), 'AuditLog List'),
    },
})

const GetMyAuditLogList: AppRouteHandler<typeof GetMyAuditLogListDef> = async (
    c,
) => {
    const query = c.req.valid('query')
    const { sub: creatorId } = c.get('jwtPayload') as AccessTokenPayload

    const creatorSpecificQuery = { ...query, creatorId }
    const data = await AuditLogCustomService.findMany(creatorSpecificQuery)
    const count = await AuditLogCustomService.count(creatorSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'AuditLog list fetched successfully',
            success: true,
        },
        OK,
    )
}

const DeleteLogByEntityIdDef = createRoute({
    path: `${path}/delete-by-entity/:entityId`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        params: z.object({
            entityId: z.string(),
        }),
    },
    responses: {
        [OK]: ApiResponse(zEmptyList, 'AuditLog deleted'),
    },
})

const DeleteLogByEntityId: AppRouteHandler<
    typeof DeleteLogByEntityIdDef
> = async (c) => {
    const params = c.req.valid('param')
    const { sub: creatorId, groupId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload

    const groupSpecificQuery = { ...params, groupId }
    await AuditLogCustomService.deleteManyByQuery(groupSpecificQuery)

    return c.json(
        {
            data: [],
            message: 'AuditLog deleted successfully',
            success: true,
        },
        OK,
    )
}

export const auditLogCustomRoutes = createRouter()
    .openapi(GetMyAuditLogListDef, GetMyAuditLogList)
    .openapi(DeleteLogByEntityIdDef, DeleteLogByEntityId)
