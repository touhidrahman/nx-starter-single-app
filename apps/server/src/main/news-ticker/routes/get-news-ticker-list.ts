import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectNewsTicker } from '../news-ticker.schema'
import { findManyNewsTickers } from '../news-ticker.service'

export const getNewsTickerRoute = createRoute({
    path: '/news-tickers',
    method: 'get',
    tags: ['News Ticker'],
    middleware: [checkToken] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            status: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectNewsTicker), 'List of News Ticker'),
    },
})

export const getNewsTickerHandler: AppRouteHandler<
    typeof getNewsTickerRoute
> = async (c) => {
    const { search, status } = c.req.query()

    const statusBool = status ? status.toLowerCase() === 'true' : undefined

    const data = await findManyNewsTickers({ search, status: statusBool })

    return c.json(
        {
            data: data,
            message: 'News tracker list',
            success: true,
        },
        OK,
    )
}
