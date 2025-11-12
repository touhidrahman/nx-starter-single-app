import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectFeedback } from '../feedback.schema'
import { countFeedbacks, getAllFeedbacks } from '../feedback.service'

export const getFeedbacksRoute = createRoute({
    path: '/v1/feedback',
    method: 'get',
    tags: ['Feedback'],
    middleware: [checkToken] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            page: z.coerce.number().optional(),
            size: z.coerce.number().optional(),
            orderBy: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectFeedback), 'List of Feedback'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const getFeedbacksHandler: AppRouteHandler<
    typeof getFeedbacksRoute
> = async (c) => {
    try {
        const { search, page, size, orderBy } = c.req.query()

        const pageNumber = Number(page)
        const limitNumber = Number(size)

        const { data, meta } = await getAllFeedbacks({
            search,
            page: pageNumber,
            size: limitNumber,
            orderBy,
        })

        const total = await countFeedbacks()
        return c.json(
            {
                data: data,
                pagination: {
                    page: meta.page,
                    size: meta.size,
                    total: total,
                },
                message: 'Feedback list',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: [],
                message: 'Internal server error',
                success: false,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
