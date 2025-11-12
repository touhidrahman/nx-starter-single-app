import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectLog } from '../audit-log.schema'
import { getAllLogs } from '../audit-log.service'

export const getLogListRoute = createRoute({
    path: '/v1/logs',
    method: 'get',
    tags: ['Logs'],
    middleware: [checkToken] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            creatorId: z.string().optional(),
            entityId: z.string().optional(),
            action: z.any().optional(),
            page: z.string().optional(),
            size: z.string().optional(),
            orderBy: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectLog), 'List of logs'),
    },
})

export const getLogListHandler: AppRouteHandler<
    typeof getLogListRoute
> = async (c) => {
    const { search, creatorId, action, entityId, page, size, orderBy } =
        c.req.query()

    const pageNumber = Number(page)
    const limitNumber = Number(size)

    const { data, meta } = await getAllLogs({
        creatorId,
        entityId,
        action,
        search,
        page: pageNumber,
        size: limitNumber,
        orderBy,
    })

    return c.json(
        {
            data: data,
            pagination: {
                page: meta.page,
                size: meta.size,
                total: meta.total,
            },
            message: 'Logs list',
            success: true,
        },
        OK,
    )
}
