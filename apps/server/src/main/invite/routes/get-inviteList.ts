import { createRoute, z } from '@hono/zod-openapi'
import { every } from 'hono/combine'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkGroupId } from '../../../core/middlewares/check-groupId.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectInvite } from '../invite.schema'
import { getAllInvites } from '../invite.service'

export const getInvitesRoute = createRoute({
    path: '/v1/invites',
    method: 'get',
    tags: ['Invite'],
    middleware: [every(checkToken, checkGroupId)] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            page: z.coerce.number().optional(),
            size: z.coerce.number().optional(),
            orderBy: z.string().optional(),
            groupId: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectInvite), 'List of invites'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const getInvitesHandler: AppRouteHandler<
    typeof getInvitesRoute
> = async (c) => {
    try {
        const { search, page, size, orderBy, groupId } = c.req.query()

        const pageNumber = Number(page)
        const limitNumber = Number(size)

        const { data, meta } = await getAllInvites({
            search,
            page: pageNumber,
            size: limitNumber,
            orderBy,
            groupId,
        })

        return c.json(
            {
                data: data,
                pagination: {
                    page: meta.page,
                    size: meta.size,
                    total: meta.totalCount,
                },
                message: 'invite list',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: [],
                message: 'Internal server error',
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
