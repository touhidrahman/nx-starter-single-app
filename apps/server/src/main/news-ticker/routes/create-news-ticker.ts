import { createRoute } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    CREATED,
    INTERNAL_SERVER_ERROR,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import {
    InsertNewsTicker,
    zInsertNewsTicker,
    zSelectNewsTicker,
} from '../news-ticker.schema'
import { createNewsTicker } from '../news-ticker.service'

export const createNewsTickerRoute = createRoute({
    path: '/v1/news-tickers',
    method: 'post',
    tags: ['News Ticker'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        body: jsonContent(zInsertNewsTicker, 'News Ticker details'),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectNewsTicker,
            'News ticker created successfully',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid News Ticker data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})

export const createNewsTickerHandler: AppRouteHandler<
    typeof createNewsTickerRoute
> = async (c) => {
    const body = c.req.valid('json') as InsertNewsTicker
    const payload = c.get('jwtPayload')
    try {
        const [newNewsTricker] = await createNewsTicker(body)

        await saveLog(
            'news_ticker',
            newNewsTricker.id,
            payload.sub,
            'create',
            {},
            toJsonSafe(newNewsTricker),
        )

        return c.json(
            {
                data: newNewsTricker,
                message: 'News Tricker created successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        c.var.logger.error(error)

        return c.json(
            {
                data: {},
                error: error?.stack ?? error,
                message: 'Failed to create News Ticker',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
