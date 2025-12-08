import { createRoute } from '@hono/zod-openapi'
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import { uploadToS3AndGetUrl } from '../../../third-party/s3.service'
import { ApiResponse } from '../../../utils/api-response.util'
import { findUserById } from '../../user/user.service'
import { FeedbackType, InsertFeedback, zInsertFeedback, zSelectFeedback } from '../feedback.schema'
import { createFeedback } from '../feedback.service'

export const createFeedbackRoute = createRoute({
    path: '/feedback',
    method: 'post',
    tags: ['Feedback'],
    middleware: [checkToken] as const,
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: zInsertFeedback,
                },
            },
        },
    },
    responses: {
        [CREATED]: ApiResponse(zSelectFeedback, 'Feedback created successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid Feedback data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})

export const createFeedbackHandler: AppRouteHandler<typeof createFeedbackRoute> = async (c) => {
    const formData = await c.req.formData()
    const payload = await c.get('jwtPayload')

    try {
        const feedbackType = formData.get('feedbackType') as FeedbackType | null
        const feedbackText = formData.get('feedbackText') as string
        const activePage = formData.get('activePage') as string
        const files = formData.getAll('files') as File[]

        if (!feedbackText || !activePage) {
            return c.json(
                {
                    data: {},
                    message: 'Feedback text and active page are required',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const fileUrls: string[] = []
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await uploadToS3AndGetUrl(file)
                fileUrls.push(url)
            }
        }

        const existingUser = await findUserById(payload.sub)
        if (!existingUser) {
            return c.json(
                {
                    data: {},
                    message: 'User not found',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const feedbackData: InsertFeedback = {
            feedbackType,
            feedbackText,
            activePage,
            fileUrls,
            creatorId: payload.sub,
        }

        const [newFeedback] = await createFeedback(feedbackData)

        return c.json(
            {
                data: newFeedback,
                message: 'Feedback created successfully',
                success: true,
            },
            CREATED,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to create Feedback',
                success: false,
                error: error instanceof Error ? error.message : undefined,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
