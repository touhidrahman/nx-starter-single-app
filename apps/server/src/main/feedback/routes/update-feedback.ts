import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    FORBIDDEN,
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
import { zSelectFeedback, zUpdateFeedback } from '../feedback.schema'
import { findFeedbackById, updateFeedback } from '../feedback.service'

export const updateFeedbackRoute = createRoute({
    path: '/v1/feedback/:id',
    method: 'patch',
    tags: ['Feedback'],
    middleware: [checkToken, isAdmin] as const,
    request: {
        params: z.object({ id: z.string() }),
        body: jsonContent(zUpdateFeedback, 'Feedback update details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectFeedback, 'Feedback updated successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid Feedback data'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Feedback not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
        [FORBIDDEN]: ApiResponse(
            zEmpty,
            'Not authorized to update this Feedback',
        ),
    },
})

export const updateFeedbackHandler: AppRouteHandler<
    typeof updateFeedbackRoute
> = async (c) => {
    const payload = await c.get('jwtPayload')
    const feedbackId = c.req.param('id')
    const body = c.req.valid('json')

    try {
        const existingFeedback = await findFeedbackById(feedbackId)

        if (!existingFeedback) {
            return c.json(
                { data: {}, message: 'Item not found', success: false },
                NOT_FOUND,
            )
        }

        const [updatedFeedback] = await updateFeedback(feedbackId, body)

        await saveLog(
            'feedback',
            feedbackId,
            payload.sub,
            'update',
            toJsonSafe(existingFeedback),
            toJsonSafe(updatedFeedback),
        )

        return c.json(
            {
                data: updatedFeedback,
                message: 'Feedback updated successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Internal Server Error',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
