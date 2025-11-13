import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { isAdmin } from '../../../core/middlewares/is-admin.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import { deleteFeedBack, findFeedbackById } from '../feedback.service'

export const deleteFeedBackRoute = createRoute({
    path: '/v1/feedback/:id',
    method: 'delete',
    tags: ['Feedback'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'FeedBack deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'FeedBack not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteFeedBackHandler: AppRouteHandler<
    typeof deleteFeedBackRoute
> = async (c) => {
    const feedbackId = c.req.param('id')
    const payload = await c.get('jwtPayload')
    try {
        const feedback = await findFeedbackById(feedbackId)
        if (!feedback) {
            return c.json(
                { data: {}, message: 'Item not found', success: false },
                NOT_FOUND,
            )
        }

        const [deleted] = await deleteFeedBack(feedbackId)

        await saveLog(
            'feedbacks',
            deleted.id,
            payload.sub,
            'delete',
            toJsonSafe(deleted),
            {},
        )

        return c.json(
            {
                data: {},
                message: 'FeedBack deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Internal Server Error',
                error,
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
