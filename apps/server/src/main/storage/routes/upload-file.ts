import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../middlewares/check-token.middleware'
import { zEmpty } from '../../../models/common.schema'
import {
    deleteS3File,
    uploadToS3AndGetUrl,
} from '../../../third-party/s3.service'
import { ApiResponse } from '../../../utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import {
    createStorageRecord,
    deleteStorageItemById,
    getStorageItemByGroupId,
} from '../../storage/storage.service'
import { zUploadProfileImage } from '../storage.schema'

export const uploadFileRoute = createRoute({
    path: '/storage/upload-file',
    method: 'post',
    tags: ['Storage'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zUploadProfileImage, 'File details'),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({
                imageUrl: z.string(),
            }),
            'Image uploaded successfully.',
        ),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid file error'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})
export const uploadFileHandler: AppRouteHandler<
    typeof uploadFileRoute
> = async (c) => {
    const body = await c.req.parseBody({ all: true })
    const file = body['file'] as File
    const payload = await c.get('jwtPayload')
    const entityName = body.entityName as string
    const entityId = body.entityId as string

    try {
        const errors: string[] = []
        const allowedFormats = ['image/jpeg', 'image/png']
        const MAX_FILE_SIZE = 5 * 1024 * 1024

        if (!file) errors.push('No file provided')

        if (!allowedFormats.includes(file.type))
            errors.push('Invalid file type')
        if (file.size > MAX_FILE_SIZE) errors.push('File size exceeds limit')

        if (errors.length > 0)
            c.json(
                {
                    data: {},
                    message: 'File validation errors occured',
                    error: errors,
                    success: false,
                },
                BAD_REQUEST,
            )

        if (!payload.sub) {
            return c.json(
                {
                    data: {},
                    message: 'Unauthorized!',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const item = await getStorageItemByGroupId(entityId)
        if (item?.url && item.url !== '') {
            const key = item?.url?.split('/').pop() ?? ''
            await deleteS3File(key)
            await deleteStorageItemById(item?.id)
        }

        const imageUrl = await uploadToS3AndGetUrl(file)

        const [doc] = await createStorageRecord({
            file,
            url: imageUrl,
            entityName,
            groupId: entityId,
            uploadedBy: payload.sub,
        })

        await saveLog(
            'storage',
            doc?.id ?? '',
            payload.sub,
            'create',
            toJsonSafe(item ?? {}),
            toJsonSafe(doc ?? {}),
        )

        return c.json(
            {
                data: { imageUrl },
                message: 'Image uploaded successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'An error occurred while uploading the image',
                success: false,
                error: error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
