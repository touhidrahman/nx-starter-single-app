import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { ApiResponse } from '../../../utils/api-response.util'
import { zSelectFeedback } from '../feedback.schema'
import { findFeedbackById } from '../feedback.service'

export const getFeedbackRoute = createRoute({
    path: '/v1/feedback/:id',
    method: 'get',
    tags: ['Feedback'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectFeedback, 'Feedback found'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Feedback not found'),
    },
})

export const getFeedbackHandler: AppRouteHandler<
    typeof getFeedbackRoute
> = async (c) => {
    const feedbackId = c.req.param('id')
    const feedback = await findFeedbackById(feedbackId)

    if (!feedback) {
        return c.json(
            { data: {}, message: 'Feedback not found', success: false },
            NOT_FOUND,
        )
    }

    return c.json(
        { data: feedback, message: 'Feedback found', success: true },
        OK,
    )
}
