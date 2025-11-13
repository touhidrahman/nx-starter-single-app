import { createRoute } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty, zId } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { deleteNewsTicker, findNewsTickerById } from '../news-ticker.service'

export const deleteNewsTickerRoute = createRoute({
    path: '/v1/news-tickers/:id',
    method: 'delete',
    tags: ['News Ticker'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'News Ticker deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'News Ticker not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteNewsTickerHandler: AppRouteHandler<
    typeof deleteNewsTickerRoute
> = async (c) => {
    const newsTickerId = c.req.param('id')
    const { sub } = c.get('jwtPayload')

    try {
        const newsTicker = await findNewsTickerById(newsTickerId)
        if (!newsTicker) {
            return c.json(
                { data: {}, message: 'News Ticker not found', success: false },
                NOT_FOUND,
            )
        }

        await deleteNewsTicker(newsTickerId)

        await saveLog(
            'news_ticker',
            newsTicker.id,
            sub,
            'delete',
            toJsonSafe(newsTicker),
            {},
        )

        return c.json(
            {
                data: {},
                message: 'News Ticker deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to delete plan',
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
