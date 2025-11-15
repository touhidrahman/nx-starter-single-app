import { createRoute, z } from '@hono/zod-openapi'
import { toInt } from 'radash'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectGroup } from '../group.schema'
import { countGroups, findManyGroups } from '../group.service'

export const getGroupsRoute = createRoute({
    path: '/groups',
    tags: ['Group'],
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            size: z.string().optional(),
            page: z.string().optional(),
            orderBy: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectGroup), 'List of Groups'),
    },
})

export const getGroupsHandler: AppRouteHandler<typeof getGroupsRoute> = async (
    c,
) => {
    const { search, page, size, orderBy } = c.req.query()

    const pageNumber = toInt(page, 1)
    const pageSize = toInt(size, 10)

    const groups = await findManyGroups({
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
