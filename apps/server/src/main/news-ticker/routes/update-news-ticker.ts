import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { isAdmin } from '../../../middlewares/is-admin.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { zSelectNewsTicker, zUpdateNewsTicker } from '../news-ticker.schema'
import { findNewsTickerById, updateNewsTicker } from '../news-ticker.service'

export const updateNewsTickerRoute = createRoute({
    path: '/v1/news-tickers/:id',
    method: 'patch',
    tags: ['News Ticker'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zUpdateNewsTicker, 'news tracker update details'),
    },
    responses: {
        [OK]: ApiResponse(
            zSelectNewsTicker,
            'news tracker updated successfully',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid news tracker data'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'news tracker not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const updateNewsTickerHandler: AppRouteHandler<
    typeof updateNewsTickerRoute
> = async (c) => {
    const newsTrickerId = c.req.param('id')
    const payload = c.get('jwtPayload')
    const body = c.req.valid('json')

    try {
        const existingNewsTracker = await findNewsTickerById(newsTrickerId)
        if (!existingNewsTracker) {
            return c.json(
                { data: {}, message: 'Item not found', success: false },
                NOT_FOUND,
            )
        }

        const [updatedNewsTracker] = await updateNewsTicker(newsTrickerId, body)

        await saveLog(
            'news_ticker',
            existingNewsTracker.id,
            payload.sub,
            'update',
            toJsonSafe(existingNewsTracker),
            toJsonSafe(updatedNewsTracker),
        )

        return c.json(
            {
                data: updatedNewsTracker,
                message: 'news tracker updated successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    message: 'Bad request',
                    success: false,
                    error: error.issues,
                },
                BAD_REQUEST,
            )
        }

        return c.json(
            {
                data: {},
                error: error,
                message: 'Internal Server Error',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
