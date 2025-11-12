import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmptyList } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectNewsTicker } from '../news-ticker.schema'
import { findManyNewsTickers } from '../news-ticker.service'

export const getNewsTickerRoute = createRoute({
    path: '/v1/news-tickers',
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
        [INTERNAL_SERVER_ERROR]: ApiResponse(
            zEmptyList,
            'Internal server error',
        ),
    },
})

export const getNewsTickerHandler: AppRouteHandler<
    typeof getNewsTickerRoute
> = async (c) => {
    try {
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
    } catch (error) {
        return c.json(
            {
                data: error,
                message: 'Internal server error',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
