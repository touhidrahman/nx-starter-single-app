import { createRoute } from '@hono/zod-openapi'
import { every } from 'hono/combine'
import { OK } from 'stoker/http-status-codes'
import { z } from 'zod'
import { AppRouteHandler } from '../../../core/core.type'
import { checkGroupId } from '../../../core/middlewares/check-groupId.middleware'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectStorage } from '../storage.schema'
import { getStorageItemsByGroup } from '../storage.service'

export const getStorageItemsByGroupRoute = createRoute({
    path: '/v1/storage',
    tags: ['Storage'],
    method: 'get',
    middleware: [every(checkToken, checkGroupId)] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            groupId: z.string().optional(),
            page: z.coerce.number().optional(),
            size: z.coerce.number().optional(),
            orderBy: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectStorage), 'Storage Item'),
    },
})

export const getStorageItemsByGroupHandler: AppRouteHandler<
    typeof getStorageItemsByGroupRoute
> = async (c) => {
    const { search, groupId, page, size, orderBy } = c.req.query()

    const pageNumber = Number(page)
    const limitNumber = Number(size)

    const { data, meta } = await getStorageItemsByGroup({
        search,
        groupId,
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
                total: meta.totalCount,
            },
            message: 'Storage list',
            success: true,
        },
        OK,
    )
}
