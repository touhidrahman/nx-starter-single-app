import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { createRouter } from '../../../core/create-app'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { REQ_METHOD } from '../../../models/common.values'
import { ApiListResponse } from '../../../utils/api-response.util'
import { buildPaginationResponse } from '../../../utils/pagination.util'
import { AccessTokenPayload } from '../../auth/auth.model'
import { zQueryInvites, zSelectInvite } from '../core/invite-core.model'
import { InviteCustomService } from './invite-custom.service'

const tags = ['Invites']
const path = '/custom/invites'

const GetMyInviteListDef = createRoute({
    path: `${path}/my`,
    tags,
    method: REQ_METHOD.GET,
    middleware: [checkToken] as const,
    request: {
        query: zQueryInvites,
    },
    responses: {
        [OK]: ApiListResponse(z.array(zSelectInvite), 'Invite List'),
    },
})

const GetMyInviteList: AppRouteHandler<typeof GetMyInviteListDef> = async (c) => {
    const query = c.req.valid('query')
    const { groupId, sub: invitedBy } = c.get('jwtPayload') as AccessTokenPayload

    const groupAndUserSpecificQuery = { ...query, groupId, invitedBy }
    const data = await InviteCustomService.findMany(groupAndUserSpecificQuery)
    const count = await InviteCustomService.count(groupAndUserSpecificQuery)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'Invite list fetched successfully',
            success: true,
        },
        OK,
    )
}

export const inviteCustomRoutes = createRouter().openapi(GetMyInviteListDef, GetMyInviteList)
