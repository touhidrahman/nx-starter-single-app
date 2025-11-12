import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectGroup } from '../group.schema'
import { countGroups, findManyGroups } from '../group.service'

export const getGroupsRoute = createRoute({
    path: '/v1/groups',
    tags: ['Group'],
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            size: z.string().optional(),
            page: z.string().optional(),
            status: z.enum(['active', 'inactive', 'pending']).optional(),
            type: z
                .enum(['client', 'vendor'])
                .transform((val) => val.toLowerCase())
                .optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectGroup), 'List of Groups'),
    },
})

export const getGroupsHandler: AppRouteHandler<typeof getGroupsRoute> = async (
    c,
) => {
    const { search, page, size, orderBy, status, type } = c.req.query()

    const pageNumber = Number.parseInt(page, 10) || 1
    const pageSize = Number.parseInt(size, 10) || 10
    const validStatus: 'active' | 'inactive' | 'pending' = status as
        | 'active'
        | 'inactive'
        | 'pending'
    const validType: 'client' | 'vendor' = type as 'client' | 'vendor'

    const groups = await findManyGroups({
        status: validStatus,
        type: validType,
        search,
        page: pageNumber,
        size: pageSize,
        orderBy,
    })

    const totalGroups = await countGroups()

    return c.json(
        {
            data: groups,
            pagination: {
                page: pageNumber,
                size: pageSize,
                total: totalGroups,
            },
            message: 'Group list',
            success: true,
        },
        OK,
    )
}
